import { DeepPartial } from 'typeorm'
import { appDataSource } from '../data_source'
import { LibraryItem } from '../entity/library_item'
import { wordsCount } from '../utils/helpers'

export const libraryItemRepository = appDataSource
  .getRepository(LibraryItem)
  .extend({
    save(libraryItem: DeepPartial<LibraryItem>) {
      return this.createQueryBuilder()
        .insert()
        .values({
          ...libraryItem,
          wordCount:
            libraryItem.wordCount ??
            wordsCount(libraryItem.readableContent || ''),
        })
        .orIgnore() // ignore if the item already exists
        .returning('*')
        .execute()
        .then((result) => result.generatedMaps[0] as LibraryItem)
    },

    findById(id: string) {
      return this.findOneBy({ id })
    },

    findByUrl(url: string) {
      return this.findOneBy({
        originalUrl: url,
      })
    },

    countByCreatedAt(createdAt: Date) {
      return this.countBy({ createdAt })
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
