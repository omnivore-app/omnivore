import { findLibraryItemById } from '../services/library_item'
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
  const { libraryItemId, userId, format, filePath } = data
  const libraryItem = await findLibraryItemById(libraryItemId, userId, {
    select: ['originalContent'],
  })
  if (!libraryItem) {
    throw new Error('Library item not found')
  }

  if (!libraryItem.originalContent) {
    throw new Error('Original content not found')
  }

  const content = convertContent(libraryItem.originalContent, format)

  await uploadToBucket(filePath, Buffer.from(content), {
    contentType: CONTENT_TYPES[format],
    timeout: 60000, // 1 minute
  })
}
