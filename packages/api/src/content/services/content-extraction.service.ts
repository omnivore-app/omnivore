/**
 * Content Extraction Service
 *
 * Orchestrates content extraction using different extractors based on
 * content type and requirements.
 */

import { logger as baseLogger } from '../../utils/logger'
import {
  RawContent,
  ExtractionOptions,
  ContentExtractor,
  ContentExtractionError,
} from '../types'
import { ContentCacheService } from './content-cache.service'
import { ContentType } from '../../events/content/content-save-event'
import { determineContentType } from '../../utils/content-type-detector'

export class ContentExtractionService {
  private logger = baseLogger.child({ context: 'content-extraction-service' })
  private extractors: Map<string, ContentExtractor> = new Map()

  constructor(
    private puppeteerExtractor: ContentExtractor,
    private readabilityExtractor: ContentExtractor,
    private cacheService: ContentCacheService
  ) {
    // Register extractors
    this.extractors.set('puppeteer', puppeteerExtractor)
    this.extractors.set('readability', readabilityExtractor)
  }

  /**
   * Extract content from URL using the most appropriate extractor
   */
  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    const startTime = Date.now()
    const contentType = determineContentType(url)

    this.logger.debug('Starting content extraction', {
      url,
      contentType,
      options,
    })

    try {
      // 1. Check cache first
      const cachedContent = await this.cacheService.get(
        url,
        contentType,
        options
      )
      if (cachedContent) {
        this.logger.info('Content extracted from cache', {
          url,
          contentType,
          duration: Date.now() - startTime,
        })
        return cachedContent
      }

      // 2. Determine extraction method
      const extractionMethod = this.determineExtractionMethod(
        url,
        contentType,
        options
      )

      // 3. Get appropriate extractor
      const extractor = this.extractors.get(extractionMethod)
      if (!extractor) {
        throw new ContentExtractionError(
          `No extractor available for method: ${extractionMethod}`,
          url,
          contentType
        )
      }

      // 4. Check if extractor can handle this content
      if (!extractor.canExtract(url, options)) {
        // Fallback to puppeteer if available
        const fallbackExtractor = this.extractors.get('puppeteer')
        if (fallbackExtractor && fallbackExtractor.canExtract(url, options)) {
          this.logger.error(
            'Primary extractor cannot handle content, falling back to Puppeteer',
            {
              url,
              contentType,
              primaryMethod: extractionMethod,
            }
          )
          const content = await fallbackExtractor.extract(url, options)
          content.metadata = {
            ...content.metadata,
            extractionMethod: 'puppeteer',
            fallback: true,
          }

          // Cache the result
          await this.cacheService.set(url, contentType, options, content)

          return content
        }

        throw new ContentExtractionError(
          `Extractor ${extractionMethod} cannot handle content from: ${url}`,
          url,
          contentType
        )
      }

      // 5. Extract content
      const content = await extractor.extract(url, options)

      // 6. Add extraction metadata
      content.metadata = {
        ...content.metadata,
        extractionMethod,
        extractionTime: Date.now() - startTime,
        fromCache: false,
      }

      // 7. Cache the result
      await this.cacheService.set(url, contentType, options, content)

      const duration = Date.now() - startTime
      this.logger.info('Content extracted successfully', {
        url,
        contentType,
        extractionMethod,
        duration,
        contentLength: content.text?.length || content.html?.length || 0,
        hasTitle: !!content.metadata?.title,
      })

      return content
    } catch (error) {
      const duration = Date.now() - startTime
      this.logger.error('Content extraction failed', {
        url,
        contentType,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      if (error instanceof ContentExtractionError) {
        throw error
      }

      throw new ContentExtractionError(
        `Content extraction failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        url,
        contentType,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Determine the best extraction method for the given content
   */
  private determineExtractionMethod(
    url: string,
    contentType: ContentType,
    options: ExtractionOptions
  ): string {
    // If JavaScript is explicitly disabled, prefer readability
    if (options.enableJavaScript === false) {
      return 'readability'
    }

    // For PDF content, use puppeteer for better handling
    if (contentType === ContentType.PDF) {
      return 'puppeteer'
    }

    // For YouTube and other dynamic content, use puppeteer
    if (contentType === ContentType.YOUTUBE) {
      return 'puppeteer'
    }

    // Check if URL likely needs JavaScript
    if (this.requiresJavaScript(url)) {
      return 'puppeteer'
    }

    // For simple HTML content, readability might be sufficient and faster
    if (contentType === ContentType.HTML && !options.customScripts?.length) {
      return 'readability'
    }

    // Default to puppeteer for complex cases
    return 'puppeteer'
  }

  /**
   * Check if URL likely requires JavaScript for content extraction
   */
  private requiresJavaScript(url: string): boolean {
    const jsRequiredPatterns = [
      /medium\.com/i,
      /twitter\.com/i,
      /x\.com/i,
      /linkedin\.com/i,
      /facebook\.com/i,
      /instagram\.com/i,
      /tiktok\.com/i,
      /reddit\.com/i,
      /youtube\.com/i,
      /youtu\.be/i,
      // Single Page Applications
      /\/app\//i,
      /\/#\//i,
    ]

    return jsRequiredPatterns.some((pattern) => pattern.test(url))
  }

  /**
   * Register a new extractor
   */
  registerExtractor(name: string, extractor: ContentExtractor): void {
    this.extractors.set(name, extractor)
    this.logger.info('Extractor registered', {
      name,
      extractorName: extractor.name,
    })
  }

  /**
   * Unregister an extractor
   */
  unregisterExtractor(name: string): void {
    this.extractors.delete(name)
    this.logger.info('Extractor unregistered', { name })
  }

  /**
   * Get available extractors
   */
  getAvailableExtractors(): string[] {
    return Array.from(this.extractors.keys())
  }

  /**
   * Test if content can be extracted from URL
   */
  async canExtract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<boolean> {
    try {
      const contentType = determineContentType(url)
      const extractionMethod = this.determineExtractionMethod(
        url,
        contentType,
        options
      )
      const extractor = this.extractors.get(extractionMethod)

      return extractor ? extractor.canExtract(url, options) : false
    } catch {
      return false
    }
  }

  /**
   * Get extraction statistics
   */
  getStats() {
    return {
      availableExtractors: this.getAvailableExtractors(),
      cacheStats: this.cacheService.getStats(),
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up content extraction service')

    // Cleanup extractors that support it
    for (const [name, extractor] of this.extractors) {
      if ('cleanup' in extractor && typeof extractor.cleanup === 'function') {
        try {
          await (extractor as any).cleanup()
          this.logger.debug('Extractor cleaned up', { name })
        } catch (error) {
          this.logger.error('Extractor cleanup failed', {
            name,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }
  }
}
