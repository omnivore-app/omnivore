/**
 * HTML Content Processor
 *
 * Processes HTML web content using extraction services and applies
 * content enrichment for web articles and pages.
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

export class HtmlContentProcessor implements ContentProcessor {
  public readonly contentType = ContentType.HTML
  private logger = baseLogger.child({ context: 'html-processor' })

  constructor(
    private extractionService: ContentExtractionService,
    private enrichmentService: ContentEnrichmentService
  ) {}

  /**
   * Check if this processor can handle the content
   */
  canProcess(contentType: ContentType, url: string): boolean {
    return contentType === ContentType.HTML
  }

  /**
   * Process HTML content
   */
  async process(
    content: RawContent,
    metadata: ContentMetadata
  ): Promise<ContentProcessorResult> {
    const startTime = Date.now()

    this.logger.debug('Processing HTML content', {
      url: content.url,
      hasHtml: !!content.html,
      hasText: !!content.text,
      hasDom: !!content.dom,
    })

    try {
      // Extract readable content from HTML
      const readableContent = await this.extractReadableContent(content)

      // Extract metadata from content
      const extractedMetadata = this.extractMetadata(content)

      // Determine item type
      const itemType = this.determineItemType(content, extractedMetadata)

      // Build initial result
      const result: ContentProcessorResult = {
        title:
          extractedMetadata.title ||
          content.metadata?.title ||
          this.extractTitleFromUrl(content.url),
        author: extractedMetadata.author || content.metadata?.byline,
        description: extractedMetadata.description || content.metadata?.excerpt,
        content: readableContent,
        wordCount: this.calculateWordCount(readableContent),
        siteName:
          extractedMetadata.siteName ||
          content.metadata?.siteName ||
          this.extractSiteNameFromUrl(content.url),
        siteIcon: extractedMetadata.siteIcon,
        thumbnail: extractedMetadata.thumbnail || content.metadata?.image,
        itemType,
        contentHash: this.generateContentHash(readableContent),
        publishedAt: this.parseDate(
          extractedMetadata.publishedAt || content.metadata?.publishedTime
        ),
        language: extractedMetadata.language || content.metadata?.lang || 'en',
        directionality: this.detectTextDirection(readableContent),
        finalUrl: content.finalUrl || content.url,
        extractedMetadata,
      }

      const processingTime = Date.now() - startTime

      this.logger.info('HTML content processed successfully', {
        url: content.url,
        title: result.title,
        wordCount: result.wordCount,
        itemType: result.itemType,
        processingTime,
      })

      return result
    } catch (error) {
      const processingTime = Date.now() - startTime

      this.logger.error('HTML content processing failed', {
        url: content.url,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Return minimal result on error
      return {
        content: content.text || content.html || '',
        title: content.metadata?.title || this.extractTitleFromUrl(content.url),
        siteName: this.extractSiteNameFromUrl(content.url),
        finalUrl: content.finalUrl || content.url,
        itemType: PageType.Article,
        wordCount: 0,
      }
    }
  }

  /**
   * Extract readable content from raw content
   */
  private async extractReadableContent(content: RawContent): Promise<string> {
    // If we already have processed text content (from Readability), use it
    if (content.text && content.metadata?.extractionMethod === 'readability') {
      return content.text
    }

    // If we have HTML, try to extract readable content
    if (content.html) {
      return this.extractTextFromHtml(content.html)
    }

    // Fallback to text content
    return content.text || ''
  }

  /**
   * Extract text content from HTML
   */
  private extractTextFromHtml(html: string): string {
    try {
      // Remove script and style tags
      let text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      return text
    } catch (error) {
      this.logger.error('Failed to extract text from HTML', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return html
    }
  }

  /**
   * Extract metadata from content
   */
  private extractMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {}

    if (!content.dom) {
      return content.metadata || {}
    }

    try {
      // Extract title
      const titleElement = content.dom.querySelector('title')
      if (titleElement) {
        metadata.title = titleElement.textContent?.trim()
      }

      // Extract meta tags
      const metaTags = content.dom.querySelectorAll('meta')
      metaTags.forEach((meta) => {
        const name = meta.getAttribute('name') || meta.getAttribute('property')
        const content = meta.getAttribute('content')

        if (name && content) {
          switch (name.toLowerCase()) {
            case 'description':
              metadata.description = content
              break
            case 'author':
            case 'article:author':
              metadata.author = content
              break
            case 'og:title':
              metadata.title = metadata.title || content
              break
            case 'og:description':
              metadata.description = metadata.description || content
              break
            case 'og:image':
              metadata.thumbnail = content
              break
            case 'og:site_name':
              metadata.siteName = content
              break
            case 'article:published_time':
            case 'pubdate':
              metadata.publishedAt = content
              break
            case 'twitter:image':
              metadata.thumbnail = metadata.thumbnail || content
              break
            case 'twitter:creator':
              metadata.author = metadata.author || content.replace('@', '')
              break
          }
        }
      })

      // Extract canonical URL
      const canonical = content.dom.querySelector('link[rel="canonical"]')
      if (canonical) {
        metadata.canonicalUrl = canonical.getAttribute('href')
      }

      // Extract site icon
      const icon = content.dom.querySelector(
        'link[rel="icon"], link[rel="shortcut icon"]'
      )
      if (icon) {
        metadata.siteIcon = icon.getAttribute('href')
      }

      // Extract language
      const htmlElement = content.dom.querySelector('html')
      if (htmlElement) {
        metadata.language = htmlElement.getAttribute('lang')
      }

      return { ...content.metadata, ...metadata }
    } catch (error) {
      this.logger.error('Failed to extract metadata', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return content.metadata || {}
    }
  }

  /**
   * Determine item type based on content and metadata
   */
  private determineItemType(
    content: RawContent,
    metadata: Record<string, any>
  ): PageType {
    const url = content.url.toLowerCase()

    // Check for specific content types
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return PageType.Article // YouTube videos are treated as articles
    }

    if (url.includes('twitter.com') || url.includes('x.com')) {
      return PageType.Tweet
    }

    if (url.includes('github.com')) {
      return PageType.Article
    }

    // Check content structure
    if (metadata.author && metadata.publishedAt) {
      return PageType.Article
    }

    // Default to article for HTML content
    return PageType.Article
  }

  /**
   * Calculate word count from text
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
   * Generate content hash for deduplication
   */
  private generateContentHash(content: string): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(content.trim()).digest('hex')
  }

  /**
   * Parse date string to Date object
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
   * Detect text direction
   */
  private detectTextDirection(text: string): 'LTR' | 'RTL' {
    // Simple RTL detection
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF]/
    const sample = text.substring(0, 500)

    return rtlRegex.test(sample) ? 'RTL' : 'LTR'
  }

  /**
   * Extract title from URL as fallback
   */
  private extractTitleFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url)
      const pathname = parsedUrl.pathname

      const title = pathname
        .split('/')
        .pop()
        ?.replace(/\.[^/.]+$/, '') // Remove file extension
        ?.replace(/[-_]/g, ' ') // Replace hyphens and underscores
        ?.replace(/\b\w/g, (l) => l.toUpperCase()) // Title case

      return title || parsedUrl.hostname
    } catch {
      return url
    }
  }

  /**
   * Extract site name from URL
   */
  private extractSiteNameFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.hostname.replace(/^www\./, '')
    } catch {
      return 'Unknown Site'
    }
  }
}
