import { libraryItemRepository } from '.'

export const getLibraryItemById = async (id: string) => {
  return libraryItemRepository.findOneBy({ id })
}

export const getLibraryItemByUrl = async (url: string) => {
  return libraryItemRepository.findOneBy({
    originalUrl: url,
  })
}
