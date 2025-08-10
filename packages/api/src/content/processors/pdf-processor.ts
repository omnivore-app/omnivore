/**
 * PDF Content Processor
 *
 * Processes PDF documents by extracting text content and metadata.
 * Handles both URL-based PDFs and uploaded PDF files.
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

export class PdfContentProcessor implements ContentProcessor {
  public readonly contentType = ContentType.PDF
  private logger = baseLogger.child({ context: 'pdf-processor' })

  constructor(
    private extractionService: ContentExtractionService,
    private enrichmentService: ContentEnrichmentService
  ) {}

  /**
   * Check if this processor can handle the content
   */
  canProcess(contentType: ContentType, url: string): boolean {
    return contentType === ContentType.PDF || url.toLowerCase().endsWith('.pdf')
  }

  /**
   * Process PDF content
   */
  async process(
    content: RawContent,
    metadata: ContentMetadata
  ): Promise<ContentProcessorResult> {
    const startTime = Date.now()

    this.logger.debug('Processing PDF content', {
      url: content.url,
      hasText: !!content.text,
      hasMetadata: !!content.metadata,
    })

    try {
      // Extract text content from PDF
      const textContent = await this.extractTextContent(content)

      // Extract PDF metadata
      const pdfMetadata = this.extractPdfMetadata(content)

      // Generate title from filename or metadata
      const title = this.generateTitle(content, pdfMetadata)

      // Build result
      const result: ContentProcessorResult = {
        title,
        author: pdfMetadata.author,
        description:
          pdfMetadata.subject || this.generateDescription(textContent),
        content: textContent,
        wordCount: this.calculateWordCount(textContent),
        siteName: this.extractSiteNameFromUrl(content.url),
        itemType: PageType.File,
        contentHash: this.generateContentHash(textContent),
        publishedAt: this.parseDate(pdfMetadata.creationDate),
        language: this.detectLanguage(textContent),
        directionality: this.detectTextDirection(textContent),
        finalUrl: content.finalUrl || content.url,
        extractedMetadata: pdfMetadata,
      }

      const processingTime = Date.now() - startTime

      this.logger.info('PDF content processed successfully', {
        url: content.url,
        title: result.title,
        wordCount: result.wordCount,
        hasAuthor: !!result.author,
        processingTime,
      })

      return result
    } catch (error) {
      const processingTime = Date.now() - startTime

      this.logger.error('PDF content processing failed', {
        url: content.url,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Return minimal result on error
      return {
        content: content.text || 'PDF content could not be extracted',
        title: this.extractTitleFromUrl(content.url),
        siteName: this.extractSiteNameFromUrl(content.url),
        finalUrl: content.finalUrl || content.url,
        itemType: PageType.File,
        wordCount: 0,
      }
    }
  }

  /**
   * Extract text content from PDF
   */
  private async extractTextContent(content: RawContent): Promise<string> {
    // If we already have extracted text, use it
    if (content.text) {
      return content.text
    }

    // If we have HTML content (from PDF conversion), extract text
    if (content.html) {
      return this.extractTextFromHtml(content.html)
    }

    // If we have raw PDF data, we'd need a PDF parsing library
    // For now, return placeholder text
    this.logger.warn('No text content available for PDF', {
      url: content.url,
    })

    return 'PDF content extraction in progress...'
  }

  /**
   * Extract text from HTML (converted PDF)
   */
  private extractTextFromHtml(html: string): string {
    try {
      return html
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
    } catch (error) {
      this.logger.warn('Failed to extract text from PDF HTML', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return html
    }
  }

  /**
   * Extract PDF metadata
   */
  private extractPdfMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {}

    // Extract from existing metadata
    if (content.metadata) {
      metadata.title = content.metadata.title
      metadata.author = content.metadata.author
      metadata.subject =
        content.metadata.subject || content.metadata.description
      metadata.creator = content.metadata.creator
      metadata.producer = content.metadata.producer
      metadata.creationDate =
        content.metadata.creationDate || content.metadata.publishedTime
      metadata.modificationDate = content.metadata.modificationDate
      metadata.pageCount = content.metadata.pageCount
    }

    // Try to extract from filename
    const filename = this.extractFilenameFromUrl(content.url)
    if (filename && !metadata.title) {
      metadata.title = this.cleanFilename(filename)
    }

    return metadata
  }

  /**
   * Generate title for PDF
   */
  private generateTitle(
    content: RawContent,
    metadata: Record<string, any>
  ): string {
    // Use PDF metadata title if available
    if (metadata.title && metadata.title.trim()) {
      return this.cleanTitle(metadata.title)
    }

    // Extract from filename
    const filename = this.extractFilenameFromUrl(content.url)
    if (filename) {
      return this.cleanFilename(filename)
    }

    // Fallback to URL-based title
    return this.extractTitleFromUrl(content.url)
  }

  /**
   * Generate description from content
   */
  private generateDescription(content: string): string {
    if (!content || content.trim().length === 0) {
      return ''
    }

    // Take first few sentences as description
    const sentences = content.split(/[.!?]+/)
    const description = sentences.slice(0, 3).join('. ').trim()

    return description.length > 500
      ? description.substring(0, 497) + '...'
      : description
  }

  /**
   * Extract filename from URL
   */
  private extractFilenameFromUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url)
      const pathname = parsedUrl.pathname
      const filename = pathname.split('/').pop()

      return filename && filename.includes('.') ? filename : null
    } catch {
      return null
    }
  }

  /**
   * Clean filename for use as title
   */
  private cleanFilename(filename: string): string {
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' ') // Replace hyphens and underscores
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase()) // Title case
  }

  /**
   * Clean title text
   */
  private cleanTitle(title: string): string {
    return title.replace(/\s+/g, ' ').trim().substring(0, 500) // Limit length
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
   * Detect content language (simplified)
   */
  private detectLanguage(text: string): string {
    // This is a simplified implementation
    // In practice, you might use a language detection library

    const sample = text.substring(0, 1000).toLowerCase()

    // Simple pattern matching
    if (/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/g.test(sample)) {
      return 'en'
    }

    return 'en' // Default to English
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
   * Extract title from URL as fallback
   */
  private extractTitleFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url)
      const pathname = parsedUrl.pathname

      const title = pathname
        .split('/')
        .pop()
        ?.replace(/\.[^/.]+$/, '')
        ?.replace(/[-_]/g, ' ')
        ?.replace(/\b\w/g, (l) => l.toUpperCase())

      return title || `PDF Document - ${parsedUrl.hostname}`
    } catch {
      return 'PDF Document'
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
