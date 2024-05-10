import { findLibraryItemById } from '../services/library_item'
import { logger } from '../utils/logger'
import { htmlToHighlightedMarkdown, htmlToMarkdown } from '../utils/parser'
import { uploadToBucket } from '../utils/uploads'

export const UPLOAD_CONTENT_JOB = 'UPLOAD_CONTENT_JOB'

export type ContentFormat = 'markdown' | 'highlightedMarkdown' | 'original'

export interface UploadContentJobData {
  libraryItemId: string
  userId: string
  format: ContentFormat
  filePath: string
}

const convertContent = (content: string, format: ContentFormat): string => {
  switch (format) {
    case 'markdown':
      return htmlToMarkdown(content)
    case 'highlightedMarkdown':
      return htmlToHighlightedMarkdown(content)
    case 'original':
      return content
    default:
      throw new Error('Unsupported format')
  }
}

const CONTENT_TYPES = {
  markdown: 'text/markdown',
  highlightedMarkdown: 'text/markdown',
  original: 'text/html',
}

export const uploadContentJob = async (data: UploadContentJobData) => {
  logger.info('Uploading content to bucket', data)

  const { libraryItemId, userId, format, filePath } = data
  const libraryItem = await findLibraryItemById(libraryItemId, userId, {
    select: ['originalContent'],
  })
  if (!libraryItem) {
    logger.error('Library item not found', data)
    throw new Error('Library item not found')
  }

  if (!libraryItem.originalContent) {
    logger.error('Original content not found', data)
    throw new Error('Original content not found')
  }

  logger.info('Converting content', data)
  const content = convertContent(libraryItem.originalContent, format)

  console.time('uploadToBucket')
  logger.info('Uploading content', data)
  await uploadToBucket(filePath, Buffer.from(content), {
    contentType: CONTENT_TYPES[format],
    timeout: 60000, // 1 minute
  })
  console.timeEnd('uploadToBucket')

  logger.info('Content uploaded', data)
}
