/**
 * Email Content Processor
 *
 * Processes email content including newsletters and email articles.
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

export class EmailContentProcessor implements ContentProcessor {
  public readonly contentType = ContentType.EMAIL
  private logger = baseLogger.child({ context: 'email-processor' })

  constructor(
    private extractionService: ContentExtractionService,
    private enrichmentService: ContentEnrichmentService
  ) {}

  /**
   * Check if this processor can handle the content
   */
  canProcess(contentType: ContentType, url: string): boolean {
    return (
      contentType === ContentType.EMAIL ||
      url.includes('newsletter') ||
      url.includes('email')
    )
  }

  /**
   * Process email content
   */
  async process(
    content: RawContent,
    metadata: ContentMetadata
  ): Promise<ContentProcessorResult> {
    const startTime = Date.now()

    this.logger.debug('Processing email content', {
      url: content.url,
      hasHtml: !!content.html,
      hasText: !!content.text,
    })

    try {
      // Extract readable content
      const readableContent = this.extractReadableContent(content)

      // Extract email metadata
      const emailMetadata = this.extractEmailMetadata(content)

      // Build result
      const result: ContentProcessorResult = {
        title: emailMetadata.subject || emailMetadata.title || 'Email',
        author: emailMetadata.from || emailMetadata.author,
        description: this.generateDescription(readableContent),
        content: readableContent,
        wordCount: this.calculateWordCount(readableContent),
        siteName:
          emailMetadata.siteName || this.extractSiteNameFromUrl(content.url),
        itemType: PageType.Article,
        contentHash: this.generateContentHash(readableContent),
        publishedAt: this.parseDate(emailMetadata.date),
        language: this.detectLanguage(readableContent),
        directionality: this.detectTextDirection(readableContent),
        finalUrl: content.finalUrl || content.url,
        extractedMetadata: emailMetadata,
      }

      const processingTime = Date.now() - startTime

      this.logger.info('Email content processed successfully', {
        url: content.url,
        title: result.title,
        author: result.author,
        wordCount: result.wordCount,
        processingTime,
      })

      return result
    } catch (error) {
      const processingTime = Date.now() - startTime

      this.logger.error('Email content processing failed', {
        url: content.url,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Return minimal result on error
      return {
        content:
          content.text ||
          content.html ||
          'Email content could not be processed',
        title: 'Email',
        siteName: this.extractSiteNameFromUrl(content.url),
        finalUrl: content.finalUrl || content.url,
        itemType: PageType.Article,
        wordCount: 0,
      }
    }
  }

  /**
   * Extract readable content from email
   */
  private extractReadableContent(content: RawContent): string {
    // If we have text content, use it
    if (content.text) {
      return content.text
    }

    // If we have HTML, extract text
    if (content.html) {
      return this.extractTextFromHtml(content.html)
    }

    return ''
  }

  /**
   * Extract text from HTML email
   */
  private extractTextFromHtml(html: string): string {
    try {
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    } catch (error) {
      this.logger.warn('Failed to extract text from email HTML', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return html
    }
  }

  /**
   * Extract email metadata
   */
  private extractEmailMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {}

    // Use existing metadata
    if (content.metadata) {
      metadata.subject = content.metadata.subject || content.metadata.title
      metadata.from = content.metadata.from || content.metadata.author
      metadata.to = content.metadata.to
      metadata.date = content.metadata.date || content.metadata.publishedTime
      metadata.messageId = content.metadata.messageId
    }

    // Try to extract from DOM if available
    if (content.dom) {
      // Look for email-specific elements
      const titleElement = content.dom.querySelector('title')
      if (titleElement && !metadata.subject) {
        metadata.subject = titleElement.textContent?.trim()
      }

      // Look for newsletter-specific metadata
      const newsletterMeta = content.dom.querySelector(
        'meta[name="newsletter"]'
      )
      if (newsletterMeta) {
        metadata.isNewsletter = true
        metadata.siteName = newsletterMeta.getAttribute('content')
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
      return 'Email'
    }
  }
}
