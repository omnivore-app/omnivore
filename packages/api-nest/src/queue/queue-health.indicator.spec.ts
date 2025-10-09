/**
 * QueueHealthIndicator Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getQueueToken } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { QueueHealthIndicator } from './queue-health.indicator'
import { QUEUE_NAMES } from './queue.constants'

type MockQueue = jest.Mocked<
  Pick<
    Queue,
    | 'name'
    | 'getWaitingCount'
    | 'getActiveCount'
    | 'getCompletedCount'
    | 'getFailedCount'
    | 'getDelayedCount'
    | 'isPaused'
  >
>

// Mock logger to suppress console output during tests
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
}

describe('QueueHealthIndicator', () => {
  let indicator: QueueHealthIndicator
  let contentQueue: MockQueue
  let notificationQueue: MockQueue
  let postProcessingQueue: MockQueue

  beforeEach(async () => {
    // Mock healthy queue
    const createHealthyQueueMock = (name: string) => ({
      name,
      getWaitingCount: jest.fn().mockResolvedValue(10),
      getActiveCount: jest.fn().mockResolvedValue(2),
      getCompletedCount: jest.fn().mockResolvedValue(100),
      getFailedCount: jest.fn().mockResolvedValue(5),
      getDelayedCount: jest.fn().mockResolvedValue(0),
      isPaused: jest.fn().mockResolvedValue(false),
    })

    contentQueue = createHealthyQueueMock(QUEUE_NAMES.CONTENT_PROCESSING)
    notificationQueue = createHealthyQueueMock(QUEUE_NAMES.NOTIFICATIONS)
    postProcessingQueue = createHealthyQueueMock(QUEUE_NAMES.POST_PROCESSING)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueHealthIndicator,
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

    indicator = module.get<QueueHealthIndicator>(QueueHealthIndicator)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should be defined', () => {
      expect(indicator).toBeDefined()
    })
  })

  describe('isHealthy', () => {
    it('should return healthy status when all queues are healthy', async () => {
      const result = await indicator.isHealthy('queues')

      expect(result).toHaveProperty('queues')
      expect(result.queues.status).toBe('up')
      expect(result.queues.responseTime).toBeGreaterThanOrEqual(0)
      expect(result.queues.queues).toHaveProperty(
        QUEUE_NAMES.CONTENT_PROCESSING,
      )
      expect(result.queues.queues).toHaveProperty(QUEUE_NAMES.NOTIFICATIONS)
      expect(result.queues.queues).toHaveProperty(QUEUE_NAMES.POST_PROCESSING)
    })

    it('should call getWaitingCount on all queues', async () => {
      await indicator.isHealthy('queues')

      expect(contentQueue.getWaitingCount).toHaveBeenCalled()
      expect(notificationQueue.getWaitingCount).toHaveBeenCalled()
      expect(postProcessingQueue.getWaitingCount).toHaveBeenCalled()
    })

    it('should call getActiveCount on all queues', async () => {
      await indicator.isHealthy('queues')

      expect(contentQueue.getActiveCount).toHaveBeenCalled()
      expect(notificationQueue.getActiveCount).toHaveBeenCalled()
      expect(postProcessingQueue.getActiveCount).toHaveBeenCalled()
    })

    it('should return degraded status when a queue is paused', async () => {
      contentQueue.isPaused.mockResolvedValue(true)

      const result = await indicator.isHealthy('queues')

      expect(result.queues.status).toBe('degraded')
      expect(result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].paused).toBe(
        true,
      )
      expect(result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].healthy).toBe(
        false,
      )
    })

    it('should return degraded status when too many failed jobs', async () => {
      contentQueue.getFailedCount.mockResolvedValue(150) // More than 100

      const result = await indicator.isHealthy('queues')

      expect(result.queues.status).toBe('degraded')
      expect(result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].failed).toBe(
        150,
      )
      expect(result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].healthy).toBe(
        false,
      )
    })

    it('should return degraded status when too many waiting jobs', async () => {
      contentQueue.getWaitingCount.mockResolvedValue(1500) // More than 1000

      const result = await indicator.isHealthy('queues')

      expect(result.queues.status).toBe('degraded')
      expect(result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].waiting).toBe(
        1500,
      )
      expect(result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].healthy).toBe(
        false,
      )
    })

    it('should return degraded status when one queue connection fails', async () => {
      contentQueue.getWaitingCount.mockRejectedValue(
        new Error('Connection refused'),
      )

      const result = await indicator.isHealthy('queues')

      expect(result.queues.status).toBe('degraded')
      expect(
        result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].connected,
      ).toBe(false)
      expect(result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].healthy).toBe(
        false,
      )
    })

    it('should return degraded status when all queues fail', async () => {
      contentQueue.getWaitingCount.mockRejectedValue(
        new Error('Connection refused'),
      )
      notificationQueue.getWaitingCount.mockRejectedValue(
        new Error('Connection refused'),
      )
      postProcessingQueue.getWaitingCount.mockRejectedValue(
        new Error('Connection refused'),
      )

      const result = await indicator.isHealthy('queues')

      expect(result.queues.status).toBe('degraded')
      expect(
        result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].connected,
      ).toBe(false)
      expect(result.queues.queues[QUEUE_NAMES.NOTIFICATIONS].connected).toBe(
        false,
      )
      expect(result.queues.queues[QUEUE_NAMES.POST_PROCESSING].connected).toBe(
        false,
      )
    })
  })

  describe('getDetailedHealth', () => {
    it('should return detailed health metrics for all queues', async () => {
      const result = await indicator.getDetailedHealth()

      expect(result).toHaveProperty('queues')
      expect(result).toHaveProperty('timestamp')
      expect(result.queues).toHaveProperty(QUEUE_NAMES.CONTENT_PROCESSING)
      expect(result.queues).toHaveProperty(QUEUE_NAMES.NOTIFICATIONS)
      expect(result.queues).toHaveProperty(QUEUE_NAMES.POST_PROCESSING)

      // Check content queue metrics
      const contentMetrics = result.queues[QUEUE_NAMES.CONTENT_PROCESSING]
      expect(contentMetrics).toHaveProperty('healthy', true)
      expect(contentMetrics).toHaveProperty('connected', true)
      expect(contentMetrics).toHaveProperty('waiting', 10)
      expect(contentMetrics).toHaveProperty('active', 2)
      expect(contentMetrics).toHaveProperty('completed', 100)
      expect(contentMetrics).toHaveProperty('failed', 5)
      expect(contentMetrics).toHaveProperty('delayed', 0)
      expect(contentMetrics).toHaveProperty('paused', false)
    })

    it('should return metrics with disconnected status when queue metrics fail', async () => {
      contentQueue.getWaitingCount.mockRejectedValue(
        new Error('Connection refused'),
      )

      const result = await indicator.getDetailedHealth()

      expect(result.queues[QUEUE_NAMES.CONTENT_PROCESSING].connected).toBe(
        false,
      )
      expect(result.queues[QUEUE_NAMES.CONTENT_PROCESSING].healthy).toBe(false)
      expect(result.queues[QUEUE_NAMES.NOTIFICATIONS].connected).toBe(true)
      expect(result.queues[QUEUE_NAMES.POST_PROCESSING].connected).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle queue with exactly 100 failed jobs as healthy', async () => {
      contentQueue.getFailedCount.mockResolvedValue(99)

      const result = await indicator.isHealthy('queues')

      expect(result.queues.status).toBe('up')
      expect(result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].healthy).toBe(
        true,
      )
    })

    it('should handle queue with exactly 1000 waiting jobs as healthy', async () => {
      contentQueue.getWaitingCount.mockResolvedValue(999)

      const result = await indicator.isHealthy('queues')

      expect(result.queues.status).toBe('up')
      expect(result.queues.queues[QUEUE_NAMES.CONTENT_PROCESSING].healthy).toBe(
        true,
      )
    })

    it('should handle all queues having zero jobs', async () => {
      contentQueue.getWaitingCount.mockResolvedValue(0)
      contentQueue.getActiveCount.mockResolvedValue(0)
      contentQueue.getCompletedCount.mockResolvedValue(0)
      contentQueue.getFailedCount.mockResolvedValue(0)
      contentQueue.getDelayedCount.mockResolvedValue(0)

      notificationQueue.getWaitingCount.mockResolvedValue(0)
      notificationQueue.getActiveCount.mockResolvedValue(0)
      notificationQueue.getCompletedCount.mockResolvedValue(0)
      notificationQueue.getFailedCount.mockResolvedValue(0)
      notificationQueue.getDelayedCount.mockResolvedValue(0)

      postProcessingQueue.getWaitingCount.mockResolvedValue(0)
      postProcessingQueue.getActiveCount.mockResolvedValue(0)
      postProcessingQueue.getCompletedCount.mockResolvedValue(0)
      postProcessingQueue.getFailedCount.mockResolvedValue(0)
      postProcessingQueue.getDelayedCount.mockResolvedValue(0)

      const result = await indicator.isHealthy('queues')

      expect(result.queues.status).toBe('up')
    })
  })
})
