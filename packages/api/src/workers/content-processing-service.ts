import { createHash } from 'crypto'
import { DirectionalityType, PageType } from '../generated/graphql'
import { logger as baseLogger } from '../utils/logger'
import { ContentType } from '../events/content/content-save-event'

const logger = baseLogger.child({ context: 'content-processing-service' })

export interface ProcessedContentResult {
  title?: string
  author?: string
  description?: string
  content: string
  wordCount?: number
  siteName?: string
  siteIcon?: string
  thumbnail?: string
  itemType?: PageType
  contentHash?: string
  publishedAt?: Date
  language?: string
  directionality?: DirectionalityType
  uploadFileId?: string
}

export interface ContentFetchResult {
  content: string
  title?: string
  author?: string
  description?: string
  siteName?: string
  siteIcon?: string
  thumbnail?: string
  publishedAt?: string
  language?: string
  finalUrl?: string
  contentType?: string
}

/**
 * Fetches content using the content-fetch service
 */
export async function fetchContentFromService(
  url: string,
  locale: string = 'en',
  timezone: string = 'UTC'
): Promise<ContentFetchResult> {
  const contentFetchUrl = process.env.CONTENT_FETCH_URL
  if (!contentFetchUrl) {
    throw new Error('CONTENT_FETCH_URL environment variable not set')
  }

  const requestBody = {
    url,
    locale,
    timezone,
    source: 'content-worker',
  }

  logger.info(`Fetching content from service: ${url}`)

  const response = await fetch(contentFetchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CONTENT_FETCH_TOKEN || ''}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(
      `Content fetch failed: ${response.status} ${response.statusText}`
    )
  }

  const result = await response.json()

  if (!result.content) {
    throw new Error('No content returned from content fetch service')
  }

  return result
}

/**
 * Processes HTML content
 */
export async function processHtmlContent(
  url: string,
  metadata: any
): Promise<ProcessedContentResult> {
  const fetchResult = await fetchContentFromService(
    url,
    metadata.locale || 'en',
    metadata.timezone || 'UTC'
  )

  const content = fetchResult.content
  const wordCount = countWords(content)
  const contentHash = generateContentHash(content)

  return {
    title: fetchResult.title || extractTitleFromUrl(url),
    author: fetchResult.author,
    description: fetchResult.description,
    content,
    wordCount,
    siteName: fetchResult.siteName || extractSiteNameFromUrl(url),
    siteIcon: fetchResult.siteIcon,
    thumbnail: fetchResult.thumbnail,
    itemType: PageType.Article,
    contentHash,
    publishedAt: fetchResult.publishedAt
      ? new Date(fetchResult.publishedAt)
      : undefined,
    language: fetchResult.language,
    directionality: detectTextDirection(content),
  }
}

/**
 * Processes PDF content
 */
export async function processPdfContent(
  url: string,
  metadata: any
): Promise<ProcessedContentResult> {
  // For PDFs, we need to handle file upload and processing
  const fetchResult = await fetchContentFromService(
    url,
    metadata.locale,
    metadata.timezone
  )

  // PDF content extraction would be handled by the content-fetch service
  const content = fetchResult.content || 'PDF content processing in progress...'
  const wordCount = countWords(content)
  const contentHash = generateContentHash(content)

  return {
    title: fetchResult.title || extractTitleFromUrl(url),
    author: fetchResult.author,
    description: fetchResult.description,
    content,
    wordCount,
    siteName: extractSiteNameFromUrl(url),
    itemType: PageType.File,
    contentHash,
    language: fetchResult.language || 'en',
    directionality: DirectionalityType.LTR,
  }
}

/**
 * Processes email content
 */
export async function processEmailContent(
  url: string,
  metadata: any
): Promise<ProcessedContentResult> {
  // Email processing would be handled by specialized email handlers
  const fetchResult = await fetchContentFromService(
    url,
    metadata.locale,
    metadata.timezone
  )

  const content = fetchResult.content
  const wordCount = countWords(content)
  const contentHash = generateContentHash(content)

  return {
    title: fetchResult.title || 'Email',
    author: fetchResult.author,
    description: fetchResult.description,
    content,
    wordCount,
    itemType: PageType.Article,
    contentHash,
    publishedAt: fetchResult.publishedAt
      ? new Date(fetchResult.publishedAt)
      : undefined,
    language: fetchResult.language || 'en',
    directionality: detectTextDirection(content),
  }
}

/**
 * Processes RSS content
 */
export async function processRssContent(
  url: string,
  metadata: any
): Promise<ProcessedContentResult> {
  const fetchResult = await fetchContentFromService(
    url,
    metadata.locale,
    metadata.timezone
  )

  const content = fetchResult.content
  const wordCount = countWords(content)
  const contentHash = generateContentHash(content)

  return {
    title: fetchResult.title || 'RSS Feed Item',
    author: fetchResult.author,
    description: fetchResult.description,
    content,
    wordCount,
    siteName: fetchResult.siteName || extractSiteNameFromUrl(url),
    siteIcon: fetchResult.siteIcon,
    itemType: PageType.Article,
    contentHash,
    publishedAt: fetchResult.publishedAt
      ? new Date(fetchResult.publishedAt)
      : undefined,
    language: fetchResult.language || 'en',
    directionality: detectTextDirection(content),
  }
}

/**
 * Processes YouTube content
 */
export async function processYouTubeContent(
  url: string,
  metadata: any
): Promise<ProcessedContentResult> {
  // YouTube processing would extract video metadata and transcript
  const fetchResult = await fetchContentFromService(
    url,
    metadata.locale,
    metadata.timezone
  )

  const content =
    fetchResult.content || 'YouTube video transcript processing...'
  const wordCount = countWords(content)
  const contentHash = generateContentHash(content)

  return {
    title: fetchResult.title || extractVideoTitleFromUrl(url),
    author: fetchResult.author,
    description: fetchResult.description,
    content,
    wordCount,
    siteName: 'YouTube',
    siteIcon: 'https://www.youtube.com/favicon.ico',
    thumbnail: fetchResult.thumbnail,
    itemType: PageType.Article,
    contentHash,
    publishedAt: fetchResult.publishedAt
      ? new Date(fetchResult.publishedAt)
      : undefined,
    language: fetchResult.language || 'en',
    directionality: DirectionalityType.LTR,
  }
}

/**
 * Utility functions
 */

function countWords(text: string): number {
  if (!text) return 0
  return text.trim().split(/\s+/).length
}

function generateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

function extractTitleFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname

    // Remove file extensions and clean up
    const title = pathname
      .split('/')
      .pop()
      ?.replace(/\.[^/.]+$/, '')
      ?.replace(/[-_]/g, ' ')
      ?.replace(/\b\w/g, (l) => l.toUpperCase())

    return title || parsedUrl.hostname
  } catch {
    return url
  }
}

function extractSiteNameFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname.replace(/^www\./, '')
  } catch {
    return 'Unknown Site'
  }
}

function extractVideoTitleFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    const videoId =
      parsedUrl.searchParams.get('v') || parsedUrl.pathname.split('/').pop()

    return `YouTube Video ${videoId || ''}`
  } catch {
    return 'YouTube Video'
  }
}

function detectTextDirection(text: string): DirectionalityType {
  // Simple RTL detection based on common RTL characters
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF]/

  if (rtlRegex.test(text.substring(0, 100))) {
    return DirectionalityType.RTL
  }

  return DirectionalityType.LTR
}
