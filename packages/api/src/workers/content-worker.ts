import { BaseEvent } from './../events/event-manager'
import { Worker, Job } from 'bullmq'
import { logger as baseLogger } from '../utils/logger'
import { redisDataSource } from '../redis_data_source'
import {
  ContentSaveRequestedEvent,
  EventType,
} from '../events/content/content-save-event'
import { EventManager } from '../events/event-manager'

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
    // TODO: Implement actual content processing logic
    // - Fetch content based on contentType
    // - Parse and extract readable content
    // - Save to database
    // - Generate thumbnails
    // - Apply rules

    this.logger.info(
      `${event.libraryItemId} ${event.contentType}`,
      'Content processed successfully'
    )

    await new Promise((resolve) => setTimeout(resolve, 1000))

    throw new Error('Not implemented')
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
