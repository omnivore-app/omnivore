import { entityManager } from '.'
import { LibraryItem } from '../entity/library_item'

export const libraryItemRepository = entityManager
  .getRepository(LibraryItem)
  .extend({
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
  })
