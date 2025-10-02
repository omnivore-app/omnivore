/**
 * Main Content Processing Service
 *
 * Orchestrates the entire content processing pipeline by coordinating
 * processors, extractors, validators, and enrichment services.
 */

import { ContentType } from '../../events/content/content-save-event'
import { logger as baseLogger } from '../../utils/logger'
import {
  ContentProcessor,
  ContentExtractor,
  ProcessingContext,
  ContentProcessorResult,
  ContentStats,
  ProcessingStats,
  ContentProcessingError,
  ContentMetadata,
} from '../types'
import { ContentExtractionService } from '../services/content-extraction.service'
import { ContentValidationService } from '../services/content-validation.service'
import { ContentEnrichmentService } from '../services/content-enrichment.service'
import { HandlerRegistry } from '../handlers/handler-registry'

export class ContentProcessingService {
  private logger = baseLogger.child({ context: 'content-processing-service' })
  private stats: ContentStats = {
    totalProcessed: 0,
    successfulProcessing: 0,
    failedProcessing: 0,
    averageProcessingTime: 0,
    cacheHitRate: 0,
    processingByType: {} as Record<ContentType, number>,
  }

  constructor(
    private processors: ContentProcessor[],
    private extractionService: ContentExtractionService,
    private validationService: ContentValidationService,
    private enrichmentService: ContentEnrichmentService,
    private handlerRegistry: HandlerRegistry
  ) {}

  /**
   * Main content processing method
   */
  async processContent(
    context: ProcessingContext
  ): Promise<ContentProcessorResult> {
    const processingStats: ProcessingStats = {
      startTime: Date.now(),
      cacheHit: false,
      extractionMethod: 'puppeteer', // will be updated
    }

    try {
      this.stats.totalProcessed++
      this.updateProcessingByType(context.contentType)

      // 1. Validate URL and content type
      await this.validationService.validate(context.url, context.contentType)

      // 2. Check for specialized handler first
      const specializedHandler = this.handlerRegistry.getHandler(
        context.url,
        context.contentType
      )
      if (specializedHandler) {
        this.logger.info(
          `Using specialized handler: ${specializedHandler.name}`,
          {
            url: context.url,
            handler: specializedHandler.name,
          }
        )

        try {
          // First extract content using standard extraction service
          const rawContent = await this.extractionService.extract(
            context.url,
            context.options
          )
          processingStats.cacheHit = rawContent.metadata?.fromCache === true
          processingStats.extractionMethod = 'specialized'

          // Then process with specialized handler
          const processedResult = await specializedHandler.process(rawContent)

          processingStats.endTime = Date.now()
          processingStats.duration =
            processingStats.endTime - processingStats.startTime

          // Transform processedResult to ContentProcessorResult
          const contentProcessorResult: ContentProcessorResult = {
            content: processedResult.text || processedResult.html || '',
            title:
              (processedResult.metadata as any)?.title ||
              (rawContent.metadata as any)?.title ||
              '',
            finalUrl: processedResult.url || rawContent.finalUrl || context.url,
            wordCount: (processedResult.metadata as any)?.wordCount || 0,
            author: (processedResult.metadata as any)?.author,
            description: (processedResult.metadata as any)?.description,
            siteName: (processedResult.metadata as any)?.siteName,
            thumbnail: (processedResult.metadata as any)?.thumbnail,
          }

          return await this.finalizeResult(
            contentProcessorResult,
            processingStats
          )
        } catch (handlerError) {
          // If specialized handler fails, log warning and continue with standard processing
          this.logger.error(
            'Specialized handler failed, falling back to standard processing',
            {
              url: context.url,
              handler: specializedHandler.name,
              error:
                handlerError instanceof Error
                  ? handlerError.message
                  : 'Unknown error',
            }
          )
          // Continue to standard processing below
        }
      }

      // 3. Use standard processor pipeline
      const processor = this.getProcessor(context.contentType)
      if (!processor) {
        throw new ContentProcessingError(
          `No processor found for content type: ${context.contentType}`,
          context.url,
          context.contentType
        )
      }

      // 4. Extract content
      const rawContent = await this.extractionService.extract(
        context.url,
        context.options
      )
      processingStats.cacheHit = rawContent.metadata?.fromCache === true
      processingStats.extractionMethod =
        rawContent.metadata?.extractionMethod || 'puppeteer'

      // 5. Process content
      const result = await processor.process(
        rawContent,
        context.metadata || this.getDefaultMetadata()
      )

      // 6. Enrich content
      const enrichedResult = await this.enrichmentService.enrich(result, {
        url: context.url,
        contentType: context.contentType,
      })

      processingStats.endTime = Date.now()
      processingStats.duration =
        processingStats.endTime - processingStats.startTime

      return await this.finalizeResult(enrichedResult, processingStats)
    } catch (error) {
      processingStats.endTime = Date.now()
      processingStats.duration =
        processingStats.endTime - processingStats.startTime
      processingStats.errors = [
        error instanceof Error ? error.message : 'Unknown error',
      ]

      this.stats.failedProcessing++

      this.logger.error('Content processing failed', {
        url: context.url,
        contentType: context.contentType,
        duration: processingStats.duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      if (error instanceof ContentProcessingError) {
        throw error
      }

      throw new ContentProcessingError(
        `Content processing failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        context.url,
        context.contentType,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Check if content can be processed
   */
  async canProcess(url: string, contentType?: ContentType): Promise<boolean> {
    try {
      // Check validation first
      const detectedType =
        contentType || (await this.validationService.detectContentType(url))
      await this.validationService.validate(url, detectedType)

      // Check if we have a specialized handler
      const handler = this.handlerRegistry.getHandler(url, detectedType)
      if (handler) {
        return true
      }

      // Check if we have a processor
      const processor = this.getProcessor(detectedType)
      return processor !== null
    } catch {
      return false
    }
  }

  /**
   * Get processing statistics
   */
  getStats(): ContentStats {
    return { ...this.stats }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.extractionService.cleanup()
    await this.handlerRegistry.cleanup()
  }

  /**
   * Get processor for content type
   */
  private getProcessor(contentType: ContentType): ContentProcessor | null {
    return this.processors.find((p) => p.canProcess(contentType, '')) || null
  }

  /**
   * Update processing statistics by type
   */
  private updateProcessingByType(contentType: ContentType): void {
    this.stats.processingByType[contentType] =
      (this.stats.processingByType[contentType] || 0) + 1
  }

  /**
   * Finalize processing result and update stats
   */
  private async finalizeResult(
    result: ContentProcessorResult,
    stats: ProcessingStats
  ): Promise<ContentProcessorResult> {
    this.stats.successfulProcessing++

    // Update average processing time
    const totalTime =
      this.stats.averageProcessingTime * (this.stats.successfulProcessing - 1) +
      (stats.duration || 0)
    this.stats.averageProcessingTime =
      totalTime / this.stats.successfulProcessing

    // Update cache hit rate
    if (stats.cacheHit) {
      const totalCacheableRequests = this.stats.totalProcessed
      const currentCacheHits =
        Math.round(this.stats.cacheHitRate * totalCacheableRequests) + 1
      this.stats.cacheHitRate = currentCacheHits / totalCacheableRequests
    }

    this.logger.info('Content processing completed', {
      url: result.finalUrl,
      title: result.title,
      wordCount: result.wordCount,
      duration: stats.duration,
      cacheHit: stats.cacheHit,
      extractionMethod: stats.extractionMethod,
    })

    return result
  }

  /**
   * Get default metadata when none provided
   */
  private getDefaultMetadata(): ContentMetadata {
    return {
      source: 'unified-content-processor',
      savedAt: new Date().toISOString(),
    }
  }
}
