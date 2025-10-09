/**
 * QueueHealthIndicator - Health check for BullMQ queues
 *
 * Provides health status for all configured queues including:
 * - Connection status
 * - Queue metrics (waiting, active, completed, failed jobs)
 * - Worker status
 */

import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus'
import { QUEUE_NAMES } from './queue.constants'

@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(QueueHealthIndicator.name)

  constructor(
    @InjectQueue(QUEUE_NAMES.CONTENT_PROCESSING)
    private readonly contentQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS)
    private readonly notificationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.POST_PROCESSING)
    private readonly postProcessingQueue: Queue
  ) {
    super()
  }

  /**
   * Check health of all queues
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const startTime = Date.now()

    try {
      // Get metrics for all queues
      const [contentMetrics, notificationMetrics, postProcessingMetrics] =
        await Promise.all([
          this.getQueueMetrics(this.contentQueue),
          this.getQueueMetrics(this.notificationQueue),
          this.getQueueMetrics(this.postProcessingQueue),
        ])

      const responseTime = Date.now() - startTime

      // Check if any queue is unhealthy
      const allHealthy =
        contentMetrics.healthy &&
        notificationMetrics.healthy &&
        postProcessingMetrics.healthy

      const details = {
        status: allHealthy ? 'up' : 'degraded',
        responseTime,
        queues: {
          [QUEUE_NAMES.CONTENT_PROCESSING]: contentMetrics,
          [QUEUE_NAMES.NOTIFICATIONS]: notificationMetrics,
          [QUEUE_NAMES.POST_PROCESSING]: postProcessingMetrics,
        },
      }

      if (!allHealthy) {
        this.logger.warn('Queue health check shows degraded status', details)
      }

      const result = this.getStatus(key, allHealthy, details)
      return result
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('Queue health check failed', {
        error: errorMessage,
        responseTime,
      })

      const result = this.getStatus(key, false, {
        status: 'down',
        message: errorMessage,
        responseTime,
      })

      throw new HealthCheckError('Queue health check failed', result)
    }
  }

  /**
   * Get detailed metrics for a single queue
   */
  private async getQueueMetrics(queue: Queue): Promise<{
    healthy: boolean
    connected: boolean
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
    paused: boolean
  }> {
    try {
      // Test Redis connection by getting job counts
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ])

      const isPaused = await queue.isPaused()

      // Consider unhealthy if:
      // - Queue is paused
      // - Too many failed jobs (more than 100)
      // - Too many waiting jobs (more than 1000)
      const healthy =
        !isPaused &&
        failed < 100 &&
        waiting < 1000

      return {
        healthy,
        connected: true,
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused: isPaused,
      }
    } catch (error) {
      this.logger.error(
        `Failed to get metrics for queue ${queue.name}`,
        error instanceof Error ? error.message : error
      )

      return {
        healthy: false,
        connected: false,
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: false,
      }
    }
  }

  /**
   * Get detailed health for monitoring endpoints
   */
  async getDetailedHealth(): Promise<Record<string, any>> {
    try {
      const [contentMetrics, notificationMetrics, postProcessingMetrics] =
        await Promise.all([
          this.getQueueMetrics(this.contentQueue),
          this.getQueueMetrics(this.notificationQueue),
          this.getQueueMetrics(this.postProcessingQueue),
        ])

      return {
        queues: {
          [QUEUE_NAMES.CONTENT_PROCESSING]: contentMetrics,
          [QUEUE_NAMES.NOTIFICATIONS]: notificationMetrics,
          [QUEUE_NAMES.POST_PROCESSING]: postProcessingMetrics,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      this.logger.error('Failed to get detailed health', error)
      throw error
    }
  }
}
