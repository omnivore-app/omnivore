/**
 * Unified Content Processing Service
 *
 * This module consolidates the functionality of content-fetch and content-handler
 * services into a single, cohesive content processing system within the API.
 */

import { ContentType } from '../events/content/content-save-event'
import { logger } from '../utils/logger'
import { ContentProcessingService } from './services/content-processing.service'
import { ContentExtractionService } from './services/content-extraction.service'
import { ContentCacheService } from './services/content-cache.service'
import { ContentValidationService } from './services/content-validation.service'
import { ContentEnrichmentService } from './services/content-enrichment.service'

// Processors
import { HtmlContentProcessor } from './processors/html-processor'
import { PdfContentProcessor } from './processors/pdf-processor'
import { EmailContentProcessor } from './processors/email-processor'
import { RssContentProcessor } from './processors/rss-processor'
import { YoutubeContentProcessor } from './processors/youtube-processor'

// Extractors
import { PuppeteerExtractor } from './extractors/puppeteer-extractor'
import { ReadabilityExtractor } from './extractors/readability-extractor'

// Handlers
import { HandlerRegistry } from './handlers'

export interface ContentProcessingOptions {
  locale?: string
  timezone?: string
  enableJavaScript?: boolean
  timeout?: number
  userAgent?: string
  cacheEnabled?: boolean
}

export interface ProcessedContentResult {
  title?: string
  author?: string
  description?: string
  content: string
  wordCount?: number
  siteName?: string
  siteIcon?: string
  thumbnail?: string
  itemType?: string
  contentHash?: string
  publishedAt?: Date
  language?: string
  directionality?: 'LTR' | 'RTL'
  uploadFileId?: string
  finalUrl?: string
}

/**
 * Main content processing orchestrator
 * Replaces the functionality of both content-fetch and content-handler services
 */
export class UnifiedContentProcessor {
  private contentProcessingService: ContentProcessingService
  private logger = logger.child({ context: 'unified-content-processor' })

  constructor() {
    // Initialize services
    const cacheService = new ContentCacheService()
    const validationService = new ContentValidationService()
    const enrichmentService = new ContentEnrichmentService()

    // Initialize extractors
    const puppeteerExtractor = new PuppeteerExtractor()
    const readabilityExtractor = new ReadabilityExtractor()
    const extractionService = new ContentExtractionService(
      puppeteerExtractor,
      readabilityExtractor,
      cacheService
    )

    // Initialize handler registry
    const handlerRegistry = new HandlerRegistry()

    // Initialize processors
    const processors = [
      new HtmlContentProcessor(extractionService, enrichmentService),
      new PdfContentProcessor(extractionService, enrichmentService),
      new EmailContentProcessor(extractionService, enrichmentService),
      new RssContentProcessor(extractionService, enrichmentService),
      new YoutubeContentProcessor(extractionService, enrichmentService),
    ]

    // Initialize main processing service
    this.contentProcessingService = new ContentProcessingService(
      processors,
      extractionService,
      validationService,
      enrichmentService,
      handlerRegistry
    )
  }

  /**
   * Process content from a URL
   * This is the main entry point that replaces both content-fetch and content-handler logic
   */
  async processContent(
    url: string,
    contentType: ContentType,
    options: ContentProcessingOptions = {}
  ): Promise<ProcessedContentResult> {
    const startTime = Date.now()

    this.logger.info(`Processing content: ${url} (type: ${contentType})`, {
      url,
      contentType,
      options,
    })

    try {
      const result = await this.contentProcessingService.processContent({
        url,
        contentType,
        options,
      })

      const processingTime = Date.now() - startTime
      this.logger.info(
        `Content processed successfully: ${url} (${processingTime}ms)`,
        {
          url,
          contentType,
          processingTime,
          title: result.title,
          wordCount: result.wordCount,
        }
      )

      return result
    } catch (error) {
      const processingTime = Date.now() - startTime
      this.logger.error(
        `Content processing failed: ${url} (${processingTime}ms)`,
        {
          url,
          contentType,
          processingTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      )

      throw error
    }
  }

  /**
   * Check if a URL can be processed
   */
  async canProcess(url: string, contentType?: ContentType): Promise<boolean> {
    try {
      return await this.contentProcessingService.canProcess(url, contentType)
    } catch {
      return false
    }
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return this.contentProcessingService.getStats()
  }

  /**
   * Get processing capabilities
   */
  getCapabilities() {
    return {
      supportedContentTypes: [
        ContentType.HTML,
        ContentType.PDF,
        ContentType.EMAIL,
        ContentType.RSS,
        ContentType.YOUTUBE,
      ],
      features: {
        caching: true,
        specializedHandlers: true,
        contentValidation: true,
        contentEnrichment: true,
        multipleExtractors: true,
        fallbackMechanisms: true,
      },
      extractors: ['puppeteer', 'readability'],
      processors: ['html', 'pdf', 'email', 'rss', 'youtube'],
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.contentProcessingService.cleanup()
  }
}

// Export singleton instance
export const unifiedContentProcessor = new UnifiedContentProcessor()

// Export types and interfaces
export * from './types'
export * from './processors'
export * from './handlers'
export * from './extractors'
// Export services
export { ContentCacheService } from './services/content-cache.service'
export { ContentValidationService } from './services/content-validation.service'
export { ContentEnrichmentService } from './services/content-enrichment.service'
export { ContentExtractionService } from './services/content-extraction.service'
export { ContentProcessingService } from './services/content-processing.service'
