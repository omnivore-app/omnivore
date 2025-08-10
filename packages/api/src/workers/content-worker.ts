import { BaseEvent } from './../events/event-manager'
import { Worker, Job } from 'bullmq'
import { logger as baseLogger } from '../utils/logger'
import { redisDataSource } from '../redis_data_source'
import {
  ContentSaveRequestedEvent,
  EventType,
  ContentType,
} from '../events/content/content-save-event'
import { EventManager } from '../events/event-manager'
import { LibraryItemState, DirectionalityType } from '../entity/library_item'
import { PageType } from '../generated/graphql'
import { updateLibraryItem } from '../services/library_item'
import {
  ProcessedContentResult,
  processHtmlContent,
  processPdfContent,
  processEmailContent,
  processRssContent,
  processYouTubeContent,
} from './content-processing-service'
import {
  applyLabelsToLibraryItem,
  generateThumbnail,
  applyRulesToLibraryItem,
} from './content-worker-helpers'

export const CONTENT_QUEUE_NAME = 'content-processing'
export const CONTENT_SAVE_JOB_NAME = 'process-content-save'

export interface ContentProcessingStartedEventData {
  libraryItemId: string
  userId: string
}

export interface ContentProcessingCompletedEventData {
  libraryItemId: string
  userId: string
}

export interface ContentProcessingFailedEventData {
  libraryItemId: string
  userId: string
  error: string
}

export class ContentWorker {
  private logger = baseLogger.child({ context: 'content-worker' })
  private eventManager = EventManager.getInstance()
  private worker!: Worker<ContentSaveRequestedEvent, boolean>

  constructor(concurrency = 2) {
    this.initializeAndStart(concurrency)
  }

  private initializeAndStart(concurrency: number): void {
    const redisConnection = this.getRedisConnection()

    this.worker = new Worker<ContentSaveRequestedEvent, boolean>(
      CONTENT_QUEUE_NAME,
      this.processJob.bind(this),
      {
        connection: redisConnection,
        concurrency,
        limiter: { max: 10, duration: 1000 },
        autorun: true,
      }
    )

    this.setupEventHandlers()
    this.logger.info('Content worker started and ready')
  }

  private getRedisConnection() {
    if (!redisDataSource.workerRedisClient) {
      throw new Error('Redis worker client not initialized')
    }

    return {
      host: redisDataSource.workerRedisClient.options.host,
      port: redisDataSource.workerRedisClient.options.port,
      password: redisDataSource.workerRedisClient.options.password,
      db: redisDataSource.workerRedisClient.options.db,
    }
  }

  private async processJob(
    job: Job<ContentSaveRequestedEvent>
  ): Promise<boolean> {
    if (job.name !== CONTENT_SAVE_JOB_NAME) {
      this.logger.warn(`${job.name}`, 'Unknown job type received')
      return false
    }

    const event = job.data

    this.logger.info(
      `${job.id} ${event.libraryItemId} ${event.url}`,
      'Processing content save job'
    )

    try {
      // Emit processing started event
      await this.eventManager.emit(
        new ContentProcessingStartedEvent({
          libraryItemId: event.libraryItemId,
          userId: event.userId,
        })
      )

      // Simulate content processing
      await this.processContent(event)

      // Emit processing completed event
      await this.eventManager.emit(
        new ContentProcessingCompletedEvent({
          libraryItemId: event.libraryItemId,
          userId: event.userId,
        })
      )

      return true
    } catch (error: any) {
      this.logger.error(
        `${job.id} ${event.libraryItemId} ${error.message}`,
        'Content processing failed'
      )

      // Emit processing failed event
      await this.eventManager.emit(
        new ContentProcessingFailedEvent({
          libraryItemId: event.libraryItemId,
          userId: event.userId,
          error: error.message,
        })
      )

      throw error
    }
  }

  private async processContent(
    event: ContentSaveRequestedEvent
  ): Promise<void> {
    const { userId, libraryItemId, url, contentType, metadata } = event.data

    this.logger.info(
      `${libraryItemId} ${contentType} ${url}`,
      'Starting content processing'
    )

    try {
      // Update library item state to processing
      await updateLibraryItem(
        libraryItemId,
        { state: LibraryItemState.Processing },
        userId,
        undefined,
        true // skip pubsub to avoid loops
      )

      let processedContent: ProcessedContentResult

      // Process content based on type
      switch (contentType) {
        case ContentType.HTML:
          processedContent = await processHtmlContent(url, metadata)
          break
        case ContentType.PDF:
          processedContent = await processPdfContent(url, metadata)
          break
        case ContentType.EMAIL:
          processedContent = await processEmailContent(url, metadata)
          break
        case ContentType.RSS:
          processedContent = await processRssContent(url, metadata)
          break
        case ContentType.YOUTUBE:
          processedContent = await processYouTubeContent(url, metadata)
          break
        default:
          throw new Error(`Unsupported content type: ${contentType}`)
      }

      // Update library item with processed content
      await updateLibraryItem(
        libraryItemId,
        {
          state: LibraryItemState.Succeeded,
          title: processedContent.title || url,
          author: processedContent.author,
          description: processedContent.description,
          readableContent: processedContent.content,
          wordCount: processedContent.wordCount,
          siteName: processedContent.siteName,
          siteIcon: processedContent.siteIcon,
          thumbnail: processedContent.thumbnail,
          itemType: processedContent.itemType || PageType.Article,
          textContentHash: processedContent.contentHash,
          publishedAt:
            processedContent.publishedAt || metadata.publishedAt
              ? new Date(metadata.publishedAt)
              : undefined,
          itemLanguage: processedContent.language,
          directionality: (processedContent.directionality ??
            DirectionalityType.LTR) as DirectionalityType,
        },
        userId
      )

      // Apply labels if provided
      if (metadata.labels && metadata.labels.length > 0) {
        await applyLabelsToLibraryItem(libraryItemId, metadata.labels, userId)
      }

      // Generate thumbnail if not already provided
      if (!processedContent.thumbnail && processedContent.content) {
        await generateThumbnail(libraryItemId, processedContent.content)
      }

      // Apply rules if any exist for the user
      await applyRulesToLibraryItem(libraryItemId, userId)

      this.logger.info(
        `${libraryItemId} ${contentType}`,
        'Content processed successfully'
      )
    } catch (error) {
      this.logger.error(
        `${libraryItemId} ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        'Content processing failed'
      )

      // Update library item state to failed
      await updateLibraryItem(
        libraryItemId,
        { state: LibraryItemState.Failed },
        userId,
        undefined,
        true // skip pubsub
      )

      throw error
    }
  }

  public getStatus() {
    return {
      isRunning: this.isRunning(),
      queueName: CONTENT_QUEUE_NAME,
      concurrency: this.worker.concurrency,
    }
  }

  private setupEventHandlers(): void {
    this.worker.on(
      'completed',
      (job: Job<ContentSaveRequestedEvent>, result: boolean) => {
        this.logger.info(
          `${job.id} ${job.data.libraryItemId} ${result}`,
          'Content job completed'
        )
      }
    )

    this.worker.on(
      'failed',
      (job: Job<ContentSaveRequestedEvent> | undefined, error: Error) => {
        this.logger.error(
          `${job?.id} ${job?.data.libraryItemId} ${error.message}`,
          'Content job failed'
        )
      }
    )

    this.worker.on('error', (error: Error) => {
      this.logger.error(`${error.message}`, 'Content worker error')
    })
  }

  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down content worker')
    await this.worker.close()
    this.logger.info('Content worker shut down')
  }

  public isRunning(): boolean {
    return this.worker.isRunning()
  }

  public async start(): Promise<void> {
    // Worker already starts automatically in constructor
    this.logger.info('Content worker start requested - already running')
  }

  public async stop(): Promise<void> {
    await this.shutdown()
  }
}

class ContentProcessingStartedEvent implements BaseEvent {
  public readonly eventType = 'CONTENT_PROCESSING_STARTED' as const

  constructor(public data: ContentProcessingStartedEventData) {
    this.validate()
  }

  serialize(): string {
    return JSON.stringify({
      eventType: this.eventType,
      timestamp: new Date().toISOString(),
      ...this.data,
    })
  }

  protected validate(): void {
    if (!this.data.libraryItemId) throw new Error('libraryItemId required')
    if (!this.data.userId) throw new Error('userId required')
  }
}

class ContentProcessingCompletedEvent implements BaseEvent {
  public readonly eventType = 'CONTENT_PROCESSING_COMPLETED' as const

  constructor(public data: ContentProcessingCompletedEventData) {
    this.validate()
  }

  serialize(): string {
    return JSON.stringify({
      eventType: this.eventType,
      timestamp: new Date().toISOString(),
      ...this.data,
    })
  }

  protected validate(): void {
    if (!this.data.libraryItemId) throw new Error('libraryItemId required')
    if (!this.data.userId) throw new Error('userId required')
  }
}

class ContentProcessingFailedEvent implements BaseEvent {
  public readonly eventType = 'CONTENT_PROCESSING_FAILED' as const

  constructor(public data: ContentProcessingFailedEventData) {
    this.validate()
  }

  serialize(): string {
    return JSON.stringify({
      eventType: this.eventType,
      timestamp: new Date().toISOString(),
      ...this.data,
    })
  }

  protected validate(): void {
    if (!this.data.libraryItemId) throw new Error('libraryItemId required')
    if (!this.data.userId) throw new Error('userId required')
    if (!this.data.error) throw new Error('error required')
  }
}
