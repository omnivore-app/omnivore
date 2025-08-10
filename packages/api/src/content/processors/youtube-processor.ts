/**
 * YouTube Content Processor
 *
 * Processes YouTube videos by extracting metadata and transcripts.
 */

import { logger as baseLogger } from '../../utils/logger'
import { ContentType } from '../../events/content/content-save-event'
import { PageType } from '../../generated/graphql'
import {
  ContentProcessor,
  RawContent,
  ContentMetadata,
  ContentProcessorResult,
} from '../types'
import { ContentExtractionService } from '../services/content-extraction.service'
import { ContentEnrichmentService } from '../services/content-enrichment.service'

export class YoutubeContentProcessor implements ContentProcessor {
  public readonly contentType = ContentType.YOUTUBE
  private logger = baseLogger.child({ context: 'youtube-processor' })

  constructor(
    private extractionService: ContentExtractionService,
    private enrichmentService: ContentEnrichmentService
  ) {}

  /**
   * Check if this processor can handle the content
   */
  canProcess(contentType: ContentType, url: string): boolean {
    return (
      contentType === ContentType.YOUTUBE ||
      url.includes('youtube.com/watch') ||
      url.includes('youtu.be/') ||
      url.includes('youtube.com/shorts/')
    )
  }

  /**
   * Process YouTube content
   */
  async process(
    content: RawContent,
    metadata: ContentMetadata
  ): Promise<ContentProcessorResult> {
    const startTime = Date.now()

    this.logger.debug('Processing YouTube content', {
      url: content.url,
      hasHtml: !!content.html,
      hasText: !!content.text,
    })

    try {
      // Extract video metadata
      const videoMetadata = this.extractVideoMetadata(content)

      // Extract transcript or description
      const textContent = this.extractTextContent(content, videoMetadata)

      // Build result
      const result: ContentProcessorResult = {
        title: videoMetadata.title || this.extractTitleFromUrl(content.url),
        author: videoMetadata.author || videoMetadata.channelName,
        description:
          videoMetadata.description || this.generateDescription(textContent),
        content: textContent,
        wordCount: this.calculateWordCount(textContent),
        siteName: 'YouTube',
        siteIcon: 'https://www.youtube.com/favicon.ico',
        thumbnail: videoMetadata.thumbnail,
        itemType: PageType.Article, // YouTube videos are treated as articles
        contentHash: this.generateContentHash(textContent),
        publishedAt: this.parseDate(videoMetadata.publishedDate),
        language: videoMetadata.language || this.detectLanguage(textContent),
        directionality: 'LTR', // YouTube is always LTR
        finalUrl: content.finalUrl || content.url,
        extractedMetadata: videoMetadata,
      }

      const processingTime = Date.now() - startTime

      this.logger.info('YouTube content processed successfully', {
        url: content.url,
        title: result.title,
        author: result.author,
        wordCount: result.wordCount,
        duration: videoMetadata.duration,
        processingTime,
      })

      return result
    } catch (error) {
      const processingTime = Date.now() - startTime

      this.logger.error('YouTube content processing failed', {
        url: content.url,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Return minimal result on error
      return {
        content: 'YouTube video content processing...',
        title: this.extractTitleFromUrl(content.url),
        siteName: 'YouTube',
        finalUrl: content.finalUrl || content.url,
        itemType: PageType.Article,
        wordCount: 0,
      }
    }
  }

  /**
   * Extract video metadata
   */
  private extractVideoMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {}

    // Use existing metadata
    if (content.metadata) {
      metadata.title = content.metadata.title
      metadata.author = content.metadata.author
      metadata.channelName = content.metadata.channelName
      metadata.description = content.metadata.description
      metadata.publishedDate = content.metadata.publishedDate
      metadata.duration = content.metadata.duration
      metadata.viewCount = content.metadata.viewCount
      metadata.thumbnail = content.metadata.thumbnail
      metadata.videoId = content.metadata.videoId
    }

    // Extract from DOM if available
    if (content.dom) {
      // Title
      const titleElement = content.dom.querySelector('title')
      if (titleElement && !metadata.title) {
        metadata.title = titleElement.textContent
          ?.replace(' - YouTube', '')
          .trim()
      }

      // Meta tags
      const metaTags = content.dom.querySelectorAll('meta')
      metaTags.forEach((meta) => {
        const name = meta.getAttribute('name') || meta.getAttribute('property')
        const content = meta.getAttribute('content')

        if (name && content) {
          switch (name.toLowerCase()) {
            case 'description':
              if (!metadata.description) metadata.description = content
              break
            case 'author':
              if (!metadata.author) metadata.author = content
              break
            case 'og:title':
              if (!metadata.title) metadata.title = content
              break
            case 'og:description':
              if (!metadata.description) metadata.description = content
              break
            case 'og:image':
              if (!metadata.thumbnail) metadata.thumbnail = content
              break
            case 'og:video:duration':
              if (!metadata.duration) metadata.duration = content
              break
          }
        }
      })

      // Extract video ID from URL
      if (!metadata.videoId) {
        metadata.videoId = this.extractVideoId(content.url)
      }

      // Try to extract from YouTube player data
      const scriptTags = content.dom.querySelectorAll('script')
      scriptTags.forEach((script) => {
        const scriptContent = script.textContent || ''

        // Look for ytInitialData or ytInitialPlayerResponse
        if (
          scriptContent.includes('ytInitialData') ||
          scriptContent.includes('ytInitialPlayerResponse')
        ) {
          try {
            const dataMatch = scriptContent.match(
              /var ytInitialData = ({.*?});/
            )
            if (dataMatch) {
              const data = JSON.parse(dataMatch[1])
              this.extractFromYouTubeData(data, metadata)
            }
          } catch (error) {
            // Ignore parsing errors
          }
        }
      })
    }

    return metadata
  }

  /**
   * Extract data from YouTube's initial data
   */
  private extractFromYouTubeData(
    data: any,
    metadata: Record<string, any>
  ): void {
    try {
      // Navigate YouTube's complex data structure
      const videoDetails =
        data?.contents?.twoColumnWatchNextResults?.results?.results
          ?.contents?.[0]?.videoPrimaryInfoRenderer

      if (videoDetails) {
        if (!metadata.title && videoDetails.title?.runs?.[0]?.text) {
          metadata.title = videoDetails.title.runs[0].text
        }

        if (
          !metadata.viewCount &&
          videoDetails.viewCount?.videoViewCountRenderer?.viewCount?.simpleText
        ) {
          metadata.viewCount =
            videoDetails.viewCount.videoViewCountRenderer.viewCount.simpleText
        }
      }

      // Extract channel info
      const channelInfo =
        data?.contents?.twoColumnWatchNextResults?.results?.results
          ?.contents?.[1]?.videoSecondaryInfoRenderer?.owner?.videoOwnerRenderer

      if (channelInfo && !metadata.channelName) {
        metadata.channelName = channelInfo.title?.runs?.[0]?.text
      }
    } catch (error) {
      // Ignore extraction errors
    }
  }

  /**
   * Extract text content (transcript or description)
   */
  private extractTextContent(
    content: RawContent,
    metadata: Record<string, any>
  ): string {
    // If we have a transcript, use it
    if (content.text && content.text.length > 100) {
      return content.text
    }

    // Use description as fallback
    if (metadata.description) {
      return metadata.description
    }

    // Extract from HTML if available
    if (content.html) {
      const extractedText = this.extractTextFromHtml(content.html)
      if (extractedText.length > 50) {
        return extractedText
      }
    }

    // Default content
    return `YouTube video: ${metadata.title || 'Video'}`
  }

  /**
   * Extract text from HTML
   */
  private extractTextFromHtml(html: string): string {
    try {
      // Look for description or transcript content
      const descriptionMatch = html.match(/"description":\s*"([^"]*)"/)
      if (descriptionMatch) {
        return descriptionMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
      }

      // Fallback to basic text extraction
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    } catch (error) {
      this.logger.warn('Failed to extract text from YouTube HTML', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return ''
    }
  }

  /**
   * Extract video ID from URL
   */
  private extractVideoId(url: string): string | undefined {
    try {
      const parsedUrl = new URL(url)

      // Standard YouTube URL
      if (parsedUrl.hostname.includes('youtube.com')) {
        return parsedUrl.searchParams.get('v') || undefined
      }

      // Shortened YouTube URL
      if (parsedUrl.hostname.includes('youtu.be')) {
        return parsedUrl.pathname.substring(1) || undefined
      }
    } catch {
      // Ignore URL parsing errors
    }

    return undefined
  }

  /**
   * Generate description
   */
  private generateDescription(content: string): string {
    if (!content || content.trim().length === 0) {
      return ''
    }

    const sentences = content.split(/[.!?]+/)
    const description = sentences.slice(0, 2).join('. ').trim()

    return description.length > 300
      ? description.substring(0, 297) + '...'
      : description
  }

  /**
   * Calculate word count
   */
  private calculateWordCount(text: string): number {
    if (!text || text.trim().length === 0) {
      return 0
    }

    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  /**
   * Generate content hash
   */
  private generateContentHash(content: string): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(content.trim()).digest('hex')
  }

  /**
   * Parse date string
   */
  private parseDate(dateString?: string): Date | undefined {
    if (!dateString) return undefined

    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? undefined : date
    } catch {
      return undefined
    }
  }

  /**
   * Detect language (simplified)
   */
  private detectLanguage(text: string): string {
    const sample = text.substring(0, 1000).toLowerCase()

    if (/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/g.test(sample)) {
      return 'en'
    }

    return 'en'
  }

  /**
   * Extract title from URL as fallback
   */
  private extractTitleFromUrl(url: string): string {
    const videoId = this.extractVideoId(url)
    return videoId ? `YouTube Video ${videoId}` : 'YouTube Video'
  }
}
