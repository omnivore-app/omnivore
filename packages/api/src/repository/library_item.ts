import { DeepPartial } from 'typeorm'
import { getColumns, getColumnsDbName } from '.'
import { appDataSource } from '../data_source'
import { LibraryItem } from '../entity/library_item'
import { keysToCamelCase, wordsCount } from '../utils/helpers'

const convertToLibraryItem = (item: DeepPartial<LibraryItem>) => {
  return {
    ...item,
    wordCount: item.wordCount ?? wordsCount(item.readableContent || ''),
  }
}

export const libraryItemRepository = appDataSource
  .getRepository(LibraryItem)
  .extend({
    findById(id: string) {
      return this.findOneBy({ id })
    },

    findByUserIdAndUrl(userId: string, url: string) {
      // md5 is used to hash the url to avoid the length limit of the index
      return this.createQueryBuilder()
        .where('user_id = :userId', { userId })
        .andWhere('md5(original_url) = md5(:url)', { url })
        .getOne()
    },

    countByCreatedAt(createdAt: Date) {
      return this.countBy({ createdAt })
    },

    async upsertLibraryItem(item: DeepPartial<LibraryItem>, finalUrl?: string) {
      const columns = getColumnsDbName(this)
      // overwrites columns except id and slug
      const overwrites = columns.filter(
        (column) => !['id', 'slug'].includes(column)
      )

      const hashedUrl = 'md5(original_url)'
      let conflictColumns = ['user_id', hashedUrl]

      if (item.id && finalUrl && finalUrl !== item.originalUrl) {
        // update the original url if it's different from the current one in the database
        conflictColumns = ['id']
        item.originalUrl = finalUrl
      }

      const [query, params] = this.createQueryBuilder()
        .insert()
        .into(LibraryItem)
        .values(convertToLibraryItem(item))
        .orUpdate(overwrites, conflictColumns, {
          skipUpdateIfNoValuesChanged: true,
        })
        .returning(getColumns(this))
        .getQueryAndParameters()

      // this is a workaround for the typeorm bug which quotes the md5 function
      const newQuery = query.replace(`"${hashedUrl}"`, hashedUrl)
      const results = (await this.query(newQuery, params)) as never[]

      // convert to camel case
      const newItem = keysToCamelCase(results[0]) as LibraryItem

      return newItem
    },

    createByPopularRead(name: string, userId: string) {
      return this.query(
        `
        INSERT INTO omnivore.library_item (
          slug,
          readable_content,
          original_content,
          description,
          title,
          author,
          original_url,
          item_type,
          thumbnail,
          published_at,
          site_name,
          user_id,
          word_count
        ) 
        SELECT
          slug,
          readable_content,
          original_content,
          description,
          title,
          author,
          original_url,
          $1,
          thumbnail,
          published_at,
          site_name,
          $2,
          word_count
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
