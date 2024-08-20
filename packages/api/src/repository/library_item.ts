import { DeepPartial } from 'typeorm'
import { getColumns, getColumnsDbName } from '.'
import { appDataSource } from '../data_source'
import { LibraryItem } from '../entity/library_item'
import { wordsCount } from '../utils/helpers'

const convertToLibraryItem = (item: DeepPartial<LibraryItem>) => {
  return {
    ...item,
    wordCount: item.wordCount ?? wordsCount(item.readableContent || '', true),
  }
}

export const libraryItemRepository = appDataSource
  .getRepository(LibraryItem)
  .extend({
    findById(id: string) {
      return this.findOneBy({ id })
    },

    findByUserIdAndUrl(userId: string, url: string, forUpdate = false) {
      // md5 is used to hash the url to avoid the length limit of the index
      const qb = this.createQueryBuilder()
        .where('user_id = :userId', { userId })
        .andWhere('md5(original_url) = md5(:url)', { url })

      if (forUpdate) {
        qb.setLock('pessimistic_read')
      }

      return qb.getOne()
    },

    countByCreatedAt(createdAt: Date) {
      return this.countBy({ createdAt })
    },

    async upsertLibraryItemById(item: DeepPartial<LibraryItem>) {
      const columns = getColumnsDbName(this)
      // overwrites columns except slug
      const overwrites = columns.filter((column) => column !== 'slug')

      const result = await this.createQueryBuilder()
        .insert()
        .into(LibraryItem)
        .values(convertToLibraryItem(item))
        .orUpdate(overwrites, ['id'], {
          skipUpdateIfNoValuesChanged: true,
        })
        .returning(getColumns(this))
        .execute()

      if (result.generatedMaps.length === 0) {
        throw new Error('Failed to upsert library item')
      }

      return result.generatedMaps[0] as LibraryItem
    },

    createByPopularRead(name: string, userId: string) {
      // set read_at to now and reading_progress_bottom_percent to 2
      // so the items show up in continue reading section
      return this.query(
        `
        INSERT INTO omnivore.library_item (
          slug,
          readable_content,
          description,
          title,
          author,
          original_url,
          item_type,
          thumbnail,
          published_at,
          site_name,
          user_id,
          word_count,
          read_at,
          reading_progress_bottom_percent
        ) 
        SELECT
          slug,
          readable_content,
          description,
          title,
          author,
          original_url,
          $1,
          thumbnail,
          published_at,
          site_name,
          $2,
          word_count,
          NOW(),
          2
        FROM
          omnivore.popular_read
        WHERE
          key = $3
        RETURNING *
    `,
        ['ARTICLE', userId, name]
      ) as Promise<LibraryItem[]>
    },
  })
