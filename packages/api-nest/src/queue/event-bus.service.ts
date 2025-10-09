/**
 * EventBusService - Lightweight Event Management
 *
 * Extends Node.js EventEmitter to provide type-safe event emission
 * and routing to BullMQ queues. Decouples event emission from queue
 * operations while maintaining simplicity.
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { EventEmitter } from 'events'
import {
  EVENT_NAMES,
  ContentSaveRequestedEvent,
  ContentFetchStartedEvent,
  ContentFetchCompletedEvent,
  ContentFetchFailedEvent,
  LibraryItemCreatedEvent,
  NotificationRequestedEvent,
  SearchIndexUpdateRequestedEvent,
  AppEvent,
} from './events.constants'
import {
  QUEUE_NAMES,
  JOB_TYPES,
  JOB_PRIORITY,
  JOB_CONFIG,
} from './queue.constants'

@Injectable()
export class EventBusService extends EventEmitter implements OnModuleInit {
  private readonly logger = new Logger(EventBusService.name)

  constructor(
    @InjectQueue(QUEUE_NAMES.CONTENT_PROCESSING)
    private readonly contentQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS)
    private readonly notificationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.POST_PROCESSING)
    private readonly postProcessingQueue: Queue
  ) {
    super()
    // Increase max listeners to prevent warnings (default is 10)
    this.setMaxListeners(50)
  }

  /**
   * Initialize event listeners on module startup
   */
  onModuleInit() {
    this.logger.log('Initializing EventBusService and registering event handlers')

    // Content processing events
    this.on(EVENT_NAMES.CONTENT_SAVE_REQUESTED, this.handleContentSaveRequested.bind(this))
    this.on(EVENT_NAMES.CONTENT_FETCH_STARTED, this.handleContentFetchStarted.bind(this))
    this.on(EVENT_NAMES.CONTENT_FETCH_COMPLETED, this.handleContentFetchCompleted.bind(this))
    this.on(EVENT_NAMES.CONTENT_FETCH_FAILED, this.handleContentFetchFailed.bind(this))

    // Library events
    this.on(EVENT_NAMES.LIBRARY_ITEM_CREATED, this.handleLibraryItemCreated.bind(this))

    // Notification events
    this.on(EVENT_NAMES.NOTIFICATION_REQUESTED, this.handleNotificationRequested.bind(this))

    // Post-processing events
    this.on(EVENT_NAMES.SEARCH_INDEX_UPDATE_REQUESTED, this.handleSearchIndexUpdateRequested.bind(this))

    this.logger.log('EventBusService initialized successfully')
  }

  /**
   * Type-safe event emission methods
   */

  emitContentSaveRequested(event: ContentSaveRequestedEvent) {
    this.logger.debug(`Emitting ${EVENT_NAMES.CONTENT_SAVE_REQUESTED} for item ${event.libraryItemId}`)
    this.emit(EVENT_NAMES.CONTENT_SAVE_REQUESTED, event)
  }

  emitContentFetchStarted(event: ContentFetchStartedEvent) {
    this.logger.debug(`Emitting ${EVENT_NAMES.CONTENT_FETCH_STARTED} for item ${event.libraryItemId}`)
    this.emit(EVENT_NAMES.CONTENT_FETCH_STARTED, event)
  }

  emitContentFetchCompleted(event: ContentFetchCompletedEvent) {
    this.logger.debug(`Emitting ${EVENT_NAMES.CONTENT_FETCH_COMPLETED} for item ${event.libraryItemId}`)
    this.emit(EVENT_NAMES.CONTENT_FETCH_COMPLETED, event)
  }

  emitContentFetchFailed(event: ContentFetchFailedEvent) {
    this.logger.warn(`Emitting ${EVENT_NAMES.CONTENT_FETCH_FAILED} for item ${event.libraryItemId}: ${event.error}`)
    this.emit(EVENT_NAMES.CONTENT_FETCH_FAILED, event)
  }

  emitLibraryItemCreated(event: LibraryItemCreatedEvent) {
    this.logger.debug(`Emitting ${EVENT_NAMES.LIBRARY_ITEM_CREATED} for item ${event.libraryItemId}`)
    this.emit(EVENT_NAMES.LIBRARY_ITEM_CREATED, event)
  }

  emitNotificationRequested(event: NotificationRequestedEvent) {
    this.logger.debug(`Emitting ${EVENT_NAMES.NOTIFICATION_REQUESTED} for user ${event.userId}`)
    this.emit(EVENT_NAMES.NOTIFICATION_REQUESTED, event)
  }

  emitSearchIndexUpdateRequested(event: SearchIndexUpdateRequestedEvent) {
    this.logger.debug(`Emitting ${EVENT_NAMES.SEARCH_INDEX_UPDATE_REQUESTED} for item ${event.libraryItemId}`)
    this.emit(EVENT_NAMES.SEARCH_INDEX_UPDATE_REQUESTED, event)
  }

  /**
   * Event Handlers - Route events to appropriate queues
   */

  private async handleContentSaveRequested(event: ContentSaveRequestedEvent) {
    try {
      const priority = event.priority || JOB_PRIORITY.NORMAL

      const job = await this.contentQueue.add(
        JOB_TYPES.FETCH_CONTENT,
        {
          libraryItemId: event.libraryItemId,
          url: event.url,
          userId: event.userId,
          source: event.source,
          timestamp: event.timestamp,
        },
        {
          jobId: event.libraryItemId, // Use libraryItemId as job ID for deduplication
          priority,
          attempts: JOB_CONFIG.RETRY_ATTEMPTS,
          backoff: {
            type: JOB_CONFIG.RETRY_BACKOFF_TYPE,
            delay: JOB_CONFIG.RETRY_BACKOFF_DELAY,
          },
        }
      )

      this.logger.log(`Enqueued content fetch job ${job.id} for item ${event.libraryItemId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Failed to enqueue content fetch job: ${errorMessage}`, errorStack)
      // Don't throw - log error and continue gracefully
    }
  }

  private async handleContentFetchStarted(event: ContentFetchStartedEvent) {
    this.logger.log(`Content fetch started for item ${event.libraryItemId}`)
    // Could emit metrics or update status here
  }

  private async handleContentFetchCompleted(event: ContentFetchCompletedEvent) {
    this.logger.log(
      `Content fetch completed for item ${event.libraryItemId} in ${event.processingTime}ms`
    )

    // Trigger post-processing tasks
    try {
      await this.postProcessingQueue.add(
        JOB_TYPES.UPDATE_SEARCH_INDEX,
        {
          libraryItemId: event.libraryItemId,
          timestamp: new Date(),
        },
        {
          priority: JOB_PRIORITY.LOW,
        }
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Failed to enqueue post-processing job: ${errorMessage}`, errorStack)
    }
  }

  private async handleContentFetchFailed(event: ContentFetchFailedEvent) {
    this.logger.error(
      `Content fetch failed for item ${event.libraryItemId}: ${event.error} ` +
      `(retry ${event.retryCount}, will retry: ${event.willRetry})`
    )

    // Could send notification to user if final failure
    if (!event.willRetry) {
      // Notify user of failure
      this.emitNotificationRequested({
        eventType: EVENT_NAMES.NOTIFICATION_REQUESTED,
        userId: event.userId!,
        notificationType: 'in-app',
        title: 'Content Fetch Failed',
        message: `Failed to fetch content for saved item`,
        timestamp: new Date(),
        data: {
          libraryItemId: event.libraryItemId,
          error: event.error,
        },
      })
    }
  }

  private async handleLibraryItemCreated(event: LibraryItemCreatedEvent) {
    this.logger.log(`Library item created: ${event.libraryItemId}`)
    // Could trigger analytics or other post-creation tasks
  }

  private async handleNotificationRequested(event: NotificationRequestedEvent) {
    try {
      await this.notificationQueue.add(
        JOB_TYPES.SEND_NOTIFICATION,
        {
          userId: event.userId,
          notificationType: event.notificationType,
          title: event.title,
          message: event.message,
          data: event.data,
          timestamp: event.timestamp,
        },
        {
          priority: JOB_PRIORITY.HIGH,
          attempts: 5,
        }
      )

      this.logger.log(`Enqueued notification for user ${event.userId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Failed to enqueue notification: ${errorMessage}`, errorStack)
    }
  }

  private async handleSearchIndexUpdateRequested(event: SearchIndexUpdateRequestedEvent) {
    try {
      await this.postProcessingQueue.add(
        JOB_TYPES.UPDATE_SEARCH_INDEX,
        {
          libraryItemId: event.libraryItemId,
          action: event.action,
          timestamp: event.timestamp,
        },
        {
          priority: JOB_PRIORITY.LOW,
        }
      )

      this.logger.log(`Enqueued search index update for item ${event.libraryItemId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Failed to enqueue search index update: ${errorMessage}`, errorStack)
    }
  }

  /**
   * Graceful shutdown
   */
  async onModuleDestroy() {
    this.logger.log('Shutting down EventBusService')
    this.removeAllListeners()
  }
}
