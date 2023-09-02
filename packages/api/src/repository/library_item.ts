import { entityManager } from '.'
import { LibraryItem } from '../entity/library_item'

export const getLibraryItemById = async (id: string) => {
  return libraryItemRepository.findOneBy({ id })
}

export const getLibraryItemByUrl = async (url: string) => {
  return libraryItemRepository.findOneBy({
    originalUrl: url,
  })
}

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
