import { ContentType } from '../events/content/content-save-event'

/**
 * Determines the content type based on URL and other indicators
 * @param url - The URL to analyze
 * @param mimeType - Optional MIME type from HTTP headers
 * @returns The determined ContentType
 */
export function determineContentType(
  url: string,
  mimeType?: string
): ContentType {
  // Check MIME type first if available
  if (mimeType) {
    if (mimeType.includes('application/pdf')) {
      return ContentType.PDF
    }
    if (mimeType.includes('text/html')) {
      return ContentType.HTML
    }
  }

  // Check URL patterns
  const urlLower = url.toLowerCase()

  // PDF files
  if (urlLower.endsWith('.pdf')) {
    return ContentType.PDF
  }

  // YouTube videos
  if (
    urlLower.includes('youtube.com/watch') ||
    urlLower.includes('youtu.be/') ||
    urlLower.includes('youtube.com/shorts/')
  ) {
    return ContentType.YOUTUBE
  }

  // Email patterns (if coming from email processing)
  if (urlLower.includes('mailto:') || urlLower.includes('email')) {
    return ContentType.EMAIL
  }

  // RSS/Atom feeds
  if (
    urlLower.includes('/feed') ||
    urlLower.includes('/rss') ||
    urlLower.includes('/atom') ||
    urlLower.endsWith('.xml') ||
    urlLower.endsWith('.rss')
  ) {
    return ContentType.RSS
  }

  // Default to HTML for web content
  return ContentType.HTML
}

/**
 * Validates if a content type is supported for processing
 * @param contentType - The content type to validate
 * @returns True if the content type is supported
 */
export function isSupportedContentType(contentType: ContentType): boolean {
  return Object.values(ContentType).includes(contentType)
}

/**
 * Gets the appropriate file extension for a content type
 * @param contentType - The content type
 * @returns The file extension (with dot)
 */
export function getFileExtensionForContentType(
  contentType: ContentType
): string {
  switch (contentType) {
    case ContentType.PDF:
      return '.pdf'
    case ContentType.HTML:
      return '.html'
    case ContentType.EMAIL:
      return '.eml'
    case ContentType.RSS:
      return '.xml'
    case ContentType.YOUTUBE:
      return '.mp4' // For downloaded content
    default:
      return '.txt'
  }
}

/**
 * Determines processing priority based on content type
 * @param contentType - The content type
 * @returns Priority level (lower number = higher priority)
 */
export function getProcessingPriority(contentType: ContentType): number {
  switch (contentType) {
    case ContentType.HTML:
      return 1 // Highest priority for regular web content
    case ContentType.PDF:
      return 2 // High priority for documents
    case ContentType.EMAIL:
      return 3 // Medium priority for emails
    case ContentType.RSS:
      return 4 // Lower priority for feeds
    case ContentType.YOUTUBE:
      return 5 // Lowest priority for video content
    default:
      return 3 // Default medium priority
  }
}
