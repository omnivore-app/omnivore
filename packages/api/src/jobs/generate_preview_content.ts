import { parseHTML } from 'linkedom'
import {
  findLibraryItemById,
  updateLibraryItem,
} from '../services/library_item'
import { findActiveUser } from '../services/user'
import { logger } from '../utils/logger'

export const GENERATE_PREVIEW_CONTENT_JOB = 'generate-preview'

interface GeneratePreviewContentData {
  libraryItemId: string
  userId: string
}

export const generatePreviewContent = async (
  job: GeneratePreviewContentData
) => {
  const { libraryItemId, userId } = job
  const user = await findActiveUser(userId)
  if (!user) {
    logger.error(`User not found: ${userId}`)
    return
  }

  const libraryItem = await findLibraryItemById(libraryItemId, userId, {
    select: ['id', 'readableContent', 'previewContent'],
  })
  if (!libraryItem) {
    logger.error(`Library item not found: ${libraryItemId}`)
    return
  }

  if (libraryItem.previewContent && libraryItem.previewContent.length >= 180) {
    logger.info(`Preview content already exists: ${libraryItemId}`)
    return
  }

  const content = libraryItem.readableContent
  if (!content) {
    logger.error(`Library item has no content: ${libraryItemId}`)
    return
  }

  // Generate preview content
  logger.info(`Generating preview for library item: ${libraryItemId}`)
  // the preview content should be within 600 characters
  const document = parseHTML(content).document
  const previewContent = document.documentElement.textContent
    ?.trim()
    ?.replace(/\s+/g, ' ')
    ?.replace(/\n/g, ' ')
    ?.slice(0, 600)
  if (!previewContent) {
    logger.error(
      `Failed to generate preview for library item: ${libraryItemId}`
    )
    return
  }

  logger.info('Generated preview for library item', {
    libraryItemId,
    previewContent,
  })

  await updateLibraryItem(
    libraryItemId,
    {
      previewContent,
    },
    userId,
    undefined,
    true
  )
}
