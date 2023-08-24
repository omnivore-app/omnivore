import { DeepPartial } from 'typeorm'
import { LibraryItem } from '../entity/library_item'
import { entityManager } from '../repository'
import { wordsCount } from '../utils/helpers'
import { logger } from '../utils/logger'

const MAX_CONTENT_LENGTH = 10 * 1024 * 1024 // 10MB for readable content
const CONTENT_LENGTH_ERROR = 'Your page content is too large to be saved.'

export const createLibraryItem = async (
  libraryItem: DeepPartial<LibraryItem>,
  em = entityManager
): Promise<LibraryItem> => {
  if (
    libraryItem.readableContent &&
    libraryItem.readableContent.length > MAX_CONTENT_LENGTH
  ) {
    logger.info('page content is too large', {
      url: libraryItem.originalUrl,
      contentLength: libraryItem.readableContent.length,
    })

    libraryItem.readableContent = CONTENT_LENGTH_ERROR
  }

  return em.getRepository(LibraryItem).save({
    ...libraryItem,
    savedAt: libraryItem.savedAt || new Date(),
    wordCount:
      libraryItem.wordCount ?? wordsCount(libraryItem.readableContent ?? ''),
  })
}
