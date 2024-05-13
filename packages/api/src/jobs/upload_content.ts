import { Highlight } from '../entity/highlight'
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

const convertContent = (
  content: string,
  format: ContentFormat,
  highlights?: Highlight[]
): string => {
  switch (format) {
    case 'markdown':
      return htmlToMarkdown(content)
    case 'highlightedMarkdown':
      return htmlToHighlightedMarkdown(content, highlights)
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

const getSelectOptions = (
  format: ContentFormat
): { column: 'readableContent' | 'originalContent'; highlights?: boolean } => {
  switch (format) {
    case 'markdown':
      return {
        column: 'readableContent',
      }
    case 'highlightedMarkdown':
      return {
        column: 'readableContent',
        highlights: true,
      }
    case 'original':
      return {
        column: 'originalContent',
      }
    default:
      throw new Error('Unsupported format')
  }
}

export const uploadContentJob = async (data: UploadContentJobData) => {
  logger.info('Uploading content to bucket', data)

  const { libraryItemId, userId, format, filePath } = data

  const { column, highlights } = getSelectOptions(format)
  const libraryItem = await findLibraryItemById(libraryItemId, userId, {
    select: ['id', column], // id is required for relations
    relations: {
      highlights,
    },
  })
  if (!libraryItem) {
    logger.error('Library item not found', data)
    throw new Error('Library item not found')
  }

  const content = libraryItem[column]

  if (!content) {
    logger.error(`${column} not found`, data)
    throw new Error('Content not found')
  }

  logger.info('Converting content', data)
  const convertedContent = convertContent(
    content,
    format,
    libraryItem.highlights
  )

  console.time('uploadToBucket')
  logger.info('Uploading content', data)
  await uploadToBucket(filePath, Buffer.from(convertedContent), {
    contentType: CONTENT_TYPES[format],
    timeout: 60000, // 1 minute
  })
  console.timeEnd('uploadToBucket')

  logger.info('Content uploaded', data)
}
