/**
 * RSS Content Processor
 *
 * Processes RSS/Atom feed items and articles.
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

export class RssContentProcessor implements ContentProcessor {
  public readonly contentType = ContentType.RSS
  private logger = baseLogger.child({ context: 'rss-processor' })

  constructor(
    private extractionService: ContentExtractionService,
    private enrichmentService: ContentEnrichmentService
  ) {}

  /**
   * Check if this processor can handle the content
   */
  canProcess(contentType: ContentType, url: string): boolean {
    return (
      contentType === ContentType.RSS ||
      url.includes('/feed') ||
      url.includes('/rss') ||
      url.includes('/atom') ||
      url.endsWith('.xml') ||
      url.endsWith('.rss')
    )
  }

  /**
   * Process RSS content
   */
  async process(
    content: RawContent,
    metadata: ContentMetadata
  ): Promise<ContentProcessorResult> {
    const startTime = Date.now()

    this.logger.debug('Processing RSS content', {
      url: content.url,
      hasHtml: !!content.html,
      hasText: !!content.text,
    })

    try {
      // Extract readable content
      const readableContent = this.extractReadableContent(content)

      // Extract RSS metadata
      const rssMetadata = this.extractRssMetadata(content)

      // Build result
      const result: ContentProcessorResult = {
        title: rssMetadata.title || 'RSS Feed Item',
        author: rssMetadata.author,
        description:
          rssMetadata.description || this.generateDescription(readableContent),
        content: readableContent,
        wordCount: this.calculateWordCount(readableContent),
        siteName:
          rssMetadata.siteName || this.extractSiteNameFromUrl(content.url),
        siteIcon: rssMetadata.siteIcon,
        thumbnail: rssMetadata.thumbnail,
        itemType: PageType.Article,
        contentHash: this.generateContentHash(readableContent),
        publishedAt: this.parseDate(rssMetadata.publishedDate),
        language: rssMetadata.language || this.detectLanguage(readableContent),
        directionality: this.detectTextDirection(readableContent),
        finalUrl: content.finalUrl || content.url,
        extractedMetadata: rssMetadata,
      }

      const processingTime = Date.now() - startTime

      this.logger.info('RSS content processed successfully', {
        url: content.url,
        title: result.title,
        author: result.author,
        wordCount: result.wordCount,
        processingTime,
      })

      return result
    } catch (error) {
      const processingTime = Date.now() - startTime

      this.logger.error('RSS content processing failed', {
        url: content.url,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Return minimal result on error
      return {
        content:
          content.text || content.html || 'RSS content could not be processed',
        title: 'RSS Feed Item',
        siteName: this.extractSiteNameFromUrl(content.url),
        finalUrl: content.finalUrl || content.url,
        itemType: PageType.Article,
        wordCount: 0,
      }
    }
  }

  /**
   * Extract readable content
   */
  private extractReadableContent(content: RawContent): string {
    if (content.text) {
      return content.text
    }

    if (content.html) {
      return this.extractTextFromHtml(content.html)
    }

    return ''
  }

  /**
   * Extract text from HTML
   */
  private extractTextFromHtml(html: string): string {
    try {
      return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    } catch (error) {
      this.logger.error('Failed to extract text from RSS HTML', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return html
    }
  }

  /**
   * Extract RSS metadata
   */
  private extractRssMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {}

    // Use existing metadata
    if (content.metadata) {
      metadata.title = content.metadata.title
      metadata.author = content.metadata.author || content.metadata.creator
      metadata.description =
        content.metadata.description || content.metadata.summary
      metadata.publishedDate =
        content.metadata.publishedDate || content.metadata.pubDate
      metadata.siteName = content.metadata.siteName
      metadata.language = content.metadata.language
      metadata.thumbnail = content.metadata.thumbnail || content.metadata.image
    }

    // Try to extract from XML/DOM if available
    if (content.dom) {
      // RSS 2.0 format
      const titleElement = content.dom.querySelector('title')
      if (titleElement && !metadata.title) {
        metadata.title = titleElement.textContent?.trim()
      }

      const descriptionElement = content.dom.querySelector('description')
      if (descriptionElement && !metadata.description) {
        metadata.description = descriptionElement.textContent?.trim()
      }

      const authorElement = content.dom.querySelector('author, dc\\:creator')
      if (authorElement && !metadata.author) {
        metadata.author = authorElement.textContent?.trim()
      }

      const pubDateElement = content.dom.querySelector('pubDate, published')
      if (pubDateElement && !metadata.publishedDate) {
        metadata.publishedDate = pubDateElement.textContent?.trim()
      }

      // Atom format
      const entryTitle = content.dom.querySelector('entry title')
      if (entryTitle && !metadata.title) {
        metadata.title = entryTitle.textContent?.trim()
      }

      const entrySummary = content.dom.querySelector('entry summary')
      if (entrySummary && !metadata.description) {
        metadata.description = entrySummary.textContent?.trim()
      }

      // Extract images
      const imageElement = content.dom.querySelector(
        'image url, enclosure[type^="image"]'
      )
      if (imageElement && !metadata.thumbnail) {
        metadata.thumbnail =
          imageElement.getAttribute('url') || imageElement.getAttribute('href')
      }
    }

    return metadata
  }

  /**
   * Generate description from content
   */
  private generateDescription(content: string): string {
    if (!content || content.trim().length === 0) {
      return ''
    }

    const sentences = content.split(/[.!?]+/)
    const description = sentences.slice(0, 3).join('. ').trim()

    return description.length > 400
      ? description.substring(0, 397) + '...'
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
   * Detect text direction
   */
  private detectTextDirection(text: string): 'LTR' | 'RTL' {
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF]/
    const sample = text.substring(0, 500)

    return rtlRegex.test(sample) ? 'RTL' : 'LTR'
  }

  /**
   * Extract site name from URL
   */
  private extractSiteNameFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.hostname.replace(/^www\./, '')
    } catch {
      return 'RSS Feed'
    }
  }
}
