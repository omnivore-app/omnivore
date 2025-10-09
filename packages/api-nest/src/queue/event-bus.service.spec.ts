/**
 * EventBusService Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { EventBusService } from './event-bus.service'
import { QUEUE_NAMES, JOB_TYPES, JOB_PRIORITY } from './queue.constants'
import { EVENT_NAMES } from './events.constants'

type MockQueue = jest.Mocked<Pick<Queue, 'name' | 'add'>>

// Mock logger to suppress console output during tests
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
}

describe('EventBusService', () => {
  let service: EventBusService
  let contentQueue: MockQueue
  let notificationQueue: MockQueue
  let postProcessingQueue: MockQueue

  beforeEach(async () => {
    // Mock queue objects
    contentQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
      name: QUEUE_NAMES.CONTENT_PROCESSING,
    }

    notificationQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-456' }),
      name: QUEUE_NAMES.NOTIFICATIONS,
    }

    postProcessingQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-789' }),
      name: QUEUE_NAMES.POST_PROCESSING,
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventBusService,
        {
          provide: getQueueToken(QUEUE_NAMES.CONTENT_PROCESSING),
          useValue: contentQueue,
        },
        {
          provide: getQueueToken(QUEUE_NAMES.NOTIFICATIONS),
          useValue: notificationQueue,
        },
        {
          provide: getQueueToken(QUEUE_NAMES.POST_PROCESSING),
          useValue: postProcessingQueue,
        },
      ],
    })
      .setLogger(mockLogger)
      .compile()

    service = module.get<EventBusService>(EventBusService)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should register event listeners on module init', () => {
      const listenerSpy = jest.spyOn(service, 'on')
      service.onModuleInit()

      expect(listenerSpy).toHaveBeenCalledWith(
        EVENT_NAMES.CONTENT_SAVE_REQUESTED,
        expect.any(Function),
      )
      expect(listenerSpy).toHaveBeenCalledWith(
        EVENT_NAMES.NOTIFICATION_REQUESTED,
        expect.any(Function),
      )
    })
  })

  describe('emitContentSaveRequested', () => {
    it('should emit content save requested event', async () => {
      const emitSpy = jest.spyOn(service, 'emit')

      const event = {
        eventType: EVENT_NAMES.CONTENT_SAVE_REQUESTED,
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      service.emitContentSaveRequested(event)

      expect(emitSpy).toHaveBeenCalledWith(
        EVENT_NAMES.CONTENT_SAVE_REQUESTED,
        event,
      )
    })

    it('should enqueue content fetch job when event is emitted', async () => {
      // Initialize module to register listeners
      service.onModuleInit()

      const event = {
        eventType: EVENT_NAMES.CONTENT_SAVE_REQUESTED,
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      service.emitContentSaveRequested(event)

      // Wait for async handler
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(contentQueue.add).toHaveBeenCalledWith(
        JOB_TYPES.FETCH_CONTENT,
        expect.objectContaining({
          libraryItemId: 'item-123',
          url: 'https://example.com',
          userId: 'user-123',
        }),
        expect.objectContaining({
          jobId: 'item-123',
          priority: JOB_PRIORITY.NORMAL,
        }),
      )
    })

    it('should use custom priority if provided', async () => {
      service.onModuleInit()

      const event = {
        eventType: EVENT_NAMES.CONTENT_SAVE_REQUESTED,
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        priority: JOB_PRIORITY.HIGH,
        timestamp: new Date(),
      }

      service.emitContentSaveRequested(event)

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(contentQueue.add).toHaveBeenCalledWith(
        JOB_TYPES.FETCH_CONTENT,
        expect.any(Object),
        expect.objectContaining({
          priority: JOB_PRIORITY.HIGH,
        }),
      )
    })
  })

  describe('emitContentFetchCompleted', () => {
    it('should emit content fetch completed event', () => {
      const emitSpy = jest.spyOn(service, 'emit')

      const event = {
        eventType: EVENT_NAMES.CONTENT_FETCH_COMPLETED,
        libraryItemId: 'item-123',
        jobId: 'job-123',
        contentLength: 5000,
        processingTime: 1500,
        timestamp: new Date(),
      }

      service.emitContentFetchCompleted(event)

      expect(emitSpy).toHaveBeenCalledWith(
        EVENT_NAMES.CONTENT_FETCH_COMPLETED,
        event,
      )
    })

    it('should enqueue post-processing job when content fetch completes', async () => {
      service.onModuleInit()

      const event = {
        eventType: EVENT_NAMES.CONTENT_FETCH_COMPLETED,
        libraryItemId: 'item-123',
        jobId: 'job-123',
        contentLength: 5000,
        processingTime: 1500,
        timestamp: new Date(),
      }

      service.emitContentFetchCompleted(event)

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(postProcessingQueue.add).toHaveBeenCalledWith(
        JOB_TYPES.UPDATE_SEARCH_INDEX,
        expect.objectContaining({
          libraryItemId: 'item-123',
        }),
        expect.objectContaining({
          priority: JOB_PRIORITY.LOW,
        }),
      )
    })
  })

  describe('emitContentFetchFailed', () => {
    it('should emit content fetch failed event', () => {
      const emitSpy = jest.spyOn(service, 'emit')

      const event = {
        eventType: EVENT_NAMES.CONTENT_FETCH_FAILED,
        libraryItemId: 'item-123',
        jobId: 'job-123',
        error: 'Network timeout',
        retryCount: 1,
        willRetry: true,
        timestamp: new Date(),
      }

      service.emitContentFetchFailed(event)

      expect(emitSpy).toHaveBeenCalledWith(
        EVENT_NAMES.CONTENT_FETCH_FAILED,
        event,
      )
    })

    it('should send notification when final failure occurs', async () => {
      service.onModuleInit()

      const emitNotificationSpy = jest.spyOn(
        service,
        'emitNotificationRequested',
      )

      const event = {
        eventType: EVENT_NAMES.CONTENT_FETCH_FAILED,
        libraryItemId: 'item-123',
        jobId: 'job-123',
        userId: 'user-123',
        error: 'Max retries exceeded',
        retryCount: 3,
        willRetry: false,
        timestamp: new Date(),
      }

      service.emitContentFetchFailed(event)

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(emitNotificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          notificationType: 'in-app',
        }),
      )
    })
  })

  describe('emitNotificationRequested', () => {
    it('should emit notification requested event', () => {
      const emitSpy = jest.spyOn(service, 'emit')

      const event = {
        eventType: EVENT_NAMES.NOTIFICATION_REQUESTED,
        userId: 'user-123',
        notificationType: 'email' as const,
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: new Date(),
      }

      service.emitNotificationRequested(event)

      expect(emitSpy).toHaveBeenCalledWith(
        EVENT_NAMES.NOTIFICATION_REQUESTED,
        event,
      )
    })

    it('should enqueue notification job', async () => {
      service.onModuleInit()

      const event = {
        eventType: EVENT_NAMES.NOTIFICATION_REQUESTED,
        userId: 'user-123',
        notificationType: 'email' as const,
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: new Date(),
      }

      service.emitNotificationRequested(event)

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(notificationQueue.add).toHaveBeenCalledWith(
        JOB_TYPES.SEND_NOTIFICATION,
        expect.objectContaining({
          userId: 'user-123',
          title: 'Test Notification',
          message: 'This is a test',
        }),
        expect.objectContaining({
          priority: JOB_PRIORITY.HIGH,
          attempts: 5,
        }),
      )
    })
  })

  describe('error handling', () => {
    it('should handle queue add errors gracefully', async () => {
      service.onModuleInit()

      contentQueue.add.mockRejectedValueOnce(new Error('Queue is full'))

      const event = {
        eventType: EVENT_NAMES.CONTENT_SAVE_REQUESTED,
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      // Should not throw
      service.emitContentSaveRequested(event)

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(contentQueue.add).toHaveBeenCalled()
    })
  })

  describe('graceful shutdown', () => {
    it('should remove all listeners on module destroy', async () => {
      const removeListenersSpy = jest.spyOn(service, 'removeAllListeners')

      await service.onModuleDestroy()

      expect(removeListenersSpy).toHaveBeenCalled()
    })
  })
})
