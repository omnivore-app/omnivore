/**
 * ContentProcessorService - BullMQ Worker for Content Processing
 *
 * Processes jobs from the content-processing queue to fetch and parse
 * web content for saved library items.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LibraryItemEntity, LibraryItemState } from '../../library/entities/library-item.entity'
import { EventBusService } from '../event-bus.service'
import { EVENT_NAMES } from '../events.constants'
import { QUEUE_NAMES, JOB_TYPES, JOB_CONFIG } from '../queue.constants'

/**
 * Job data interface for fetch-content jobs
 */
export interface FetchContentJobData {
  libraryItemId: string
  url: string
  userId: string
  source?: 'web' | 'mobile' | 'api' | 'extension'
  timestamp: Date
}

/**
 * Result of content fetching operation
 */
export interface ContentFetchResult {
  success: boolean
  title?: string
  content?: string
  contentType?: string
  author?: string
  publishedDate?: Date
  siteIcon?: string
  thumbnail?: string
  error?: string
}

@Injectable()
@Processor(QUEUE_NAMES.CONTENT_PROCESSING, {
  concurrency: JOB_CONFIG.WORKER_CONCURRENCY,
})
export class ContentProcessorService extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(ContentProcessorService.name)

  constructor(
    @InjectRepository(LibraryItemEntity)
    private readonly libraryItemRepository: Repository<LibraryItemEntity>,
    private readonly eventBus: EventBusService
  ) {
    super()
  }

  onModuleInit() {
    this.logger.log(
      `ContentProcessorService initialized with concurrency ${JOB_CONFIG.WORKER_CONCURRENCY}`
    )
  }

  /**
   * Main job processing method
   * Called by BullMQ for each job
   */
  async process(job: Job<FetchContentJobData, any, string>): Promise<any> {
    const { libraryItemId, url, userId, source } = job.data

    this.logger.log(
      `Processing job ${job.id} for item ${libraryItemId} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`
    )

    // Route to appropriate handler based on job name
    switch (job.name) {
      case JOB_TYPES.FETCH_CONTENT:
        return this.handleFetchContent(job)
      case JOB_TYPES.PARSE_CONTENT:
        return this.handleParseContent(job)
      default:
        throw new Error(`Unknown job type: ${job.name}`)
    }
  }

  /**
   * Handle fetch-content jobs
   */
  private async handleFetchContent(
    job: Job<FetchContentJobData>
  ): Promise<ContentFetchResult> {
    const { libraryItemId, url, userId } = job.data
    const startTime = Date.now()

    try {
      // Emit fetch started event
      this.eventBus.emitContentFetchStarted({
        eventType: EVENT_NAMES.CONTENT_FETCH_STARTED,
        libraryItemId,
        url,
        jobId: job.id!,
        timestamp: new Date(),
      })

      // Update job progress
      await job.updateProgress(10)

      // Update library item state to PROCESSING
      await this.updateLibraryItemState(libraryItemId, LibraryItemState.PROCESSING)
      await job.updateProgress(20)

      // Fetch and process content
      const result = await this.fetchContent(url, job)

      if (!result.success) {
        throw new Error(result.error || 'Content fetch failed')
      }

      await job.updateProgress(70)

      // Save content to database
      await this.saveContent(libraryItemId, result)
      await job.updateProgress(90)

      // Update library item state to SUCCEEDED
      await this.updateLibraryItemState(libraryItemId, LibraryItemState.SUCCEEDED)
      await job.updateProgress(100)

      const processingTime = Date.now() - startTime

      // Emit fetch completed event
      this.eventBus.emitContentFetchCompleted({
        eventType: EVENT_NAMES.CONTENT_FETCH_COMPLETED,
        libraryItemId,
        jobId: job.id!,
        contentLength: result.content?.length || 0,
        processingTime,
        timestamp: new Date(),
      })

      this.logger.log(
        `Successfully processed job ${job.id} for item ${libraryItemId} in ${processingTime}ms`
      )

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const willRetry = (job.attemptsMade + 1) < (job.opts.attempts || 1)

      this.logger.error(
        `Job ${job.id} failed for item ${libraryItemId}: ${errorMessage} ` +
        `(attempt ${job.attemptsMade + 1}/${job.opts.attempts}, will retry: ${willRetry})`
      )

      // Update library item state to FAILED if final attempt
      if (!willRetry) {
        await this.updateLibraryItemState(libraryItemId, LibraryItemState.FAILED)
      }

      // Emit fetch failed event
      this.eventBus.emitContentFetchFailed({
        eventType: EVENT_NAMES.CONTENT_FETCH_FAILED,
        libraryItemId,
        jobId: job.id!,
        userId,
        error: errorMessage,
        retryCount: job.attemptsMade + 1,
        willRetry,
        timestamp: new Date(),
      })

      throw error
    }
  }

  /**
   * Handle parse-content jobs (future implementation)
   */
  private async handleParseContent(job: Job<FetchContentJobData>): Promise<any> {
    this.logger.log(`Parse content job ${job.id} - Not implemented yet`)
    // TODO: Implement content parsing in Phase 3
    return { success: true, message: 'Parsing not implemented yet' }
  }

  /**
   * Fetch content from URL
   * TODO: Implement full content fetching in Phase 3 with Puppeteer/handlers
   */
  private async fetchContent(
    url: string,
    job: Job<FetchContentJobData>
  ): Promise<ContentFetchResult> {
    this.logger.log(`Fetching content from ${url}`)

    try {
      // STUB: For Phase 2, we'll just create a placeholder result
      // In Phase 3, this will be replaced with actual Puppeteer/handler logic

      // Simulate network delay
      await this.delay(1000)
      await job.updateProgress(40)

      // Simulate content processing
      await this.delay(1000)
      await job.updateProgress(60)

      // Return stub data
      return {
        success: true,
        title: `Content from ${new URL(url).hostname}`,
        content: '<p>This is stub content. Real content fetching will be implemented in Phase 3.</p>',
        contentType: 'text/html',
        author: 'Unknown',
        publishedDate: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to fetch content from ${url}: ${errorMessage}`)

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Save processed content to database
   */
  private async saveContent(
    libraryItemId: string,
    result: ContentFetchResult
  ): Promise<void> {
    this.logger.log(`Saving content for library item ${libraryItemId}`)

    try {
      await this.libraryItemRepository.update(libraryItemId, {
        title: result.title,
        readableContent: result.content,
        author: result.author,
        publishedAt: result.publishedDate,
        siteIcon: result.siteIcon,
        thumbnail: result.thumbnail,
      })

      this.logger.log(`Content saved for library item ${libraryItemId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to save content for ${libraryItemId}: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Update library item state
   */
  private async updateLibraryItemState(
    libraryItemId: string,
    state: LibraryItemState
  ): Promise<void> {
    try {
      await this.libraryItemRepository.update(libraryItemId, { state })
      this.logger.debug(`Updated library item ${libraryItemId} state to ${state}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(
        `Failed to update state for ${libraryItemId}: ${errorMessage}`
      )
      throw error
    }
  }

  /**
   * Utility: Delay for testing
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Worker event handlers
   */

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Job ${job.id} is now active`)
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`)
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number | object) {
    this.logger.debug(`Job ${job.id} progress: ${JSON.stringify(progress)}`)
  }
}
