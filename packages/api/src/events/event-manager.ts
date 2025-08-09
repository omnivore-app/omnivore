import { Queue } from 'bullmq'
import { ConnectionOptions } from 'bullmq'
import { logger } from '../utils/logger'
import { redisDataSource } from '../redis_data_source'

export interface EventEmitter {
  emit<T extends BaseEvent>(event: T): Promise<void>
}

export interface BaseEvent {
  eventType: string
  data: Record<string, any>
  serialize(): string
}

export interface EventRoute {
  queueName: string
  jobName: string
  jobOptions?: {
    attempts?: number
    backoff?: { type: 'exponential' | 'fixed'; delay: number }
    removeOnComplete?: number
    removeOnFail?: number
  }
}

export class EventManager implements EventEmitter {
  private queues: Map<string, Queue> = new Map()
  private eventRoutes: Map<string, EventRoute> = new Map()
  private redisConnection: ConnectionOptions
  private logger = logger.child({ context: 'event-manager' })

  constructor() {
    this.redisConnection = this.getRedisConnection()
    this.registerDefaultRoutes()
  }

  private getRedisConnection(): ConnectionOptions {
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

  private registerDefaultRoutes(): void {
    // Register event type to queue mappings
    this.registerRoute('CONTENT_SAVE_REQUESTED', {
      queueName: 'content-processing',
      jobName: 'process-content-save',
      jobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 10,
        removeOnFail: 50,
      },
    })

    this.registerRoute('CONTENT_PROCESSING_STARTED', {
      queueName: 'notifications',
      jobName: 'send-processing-notification',
      jobOptions: {
        attempts: 2,
        removeOnComplete: 5,
      },
    })

    this.registerRoute('CONTENT_PROCESSING_COMPLETED', {
      queueName: 'post-processing',
      jobName: 'handle-completion',
      jobOptions: {
        attempts: 2,
        removeOnComplete: 20,
      },
    })
  }

  public registerRoute(eventType: string, route: EventRoute): void {
    this.eventRoutes.set(eventType, route)
    this.logger.info(
      `${eventType} ${route.queueName} ${route.jobName}`,
      'Event route registered'
    )
  }

  public async emit<T extends BaseEvent>(event: T): Promise<void> {
    const route = this.eventRoutes.get(event.eventType)

    if (!route) {
      this.logger.warn(`${event.eventType}`, 'No route found for event type')
      return
    }

    try {
      const queue = await this.getOrCreateQueue(route.queueName)

      const job = await queue.add(route.jobName, event, route.jobOptions || {})

      this.logger.info(
        `${event.eventType} ${job.id} ${route.queueName} ${route.jobName}`,
        'Event emitted successfully'
      )
    } catch (error: any) {
      this.logger.error(
        `${event.eventType} ${error.message} ${route.queueName} ${route.jobName}`,
        'Failed to emit event'
      )
      throw error
    }
  }

  private async getOrCreateQueue(queueName: string): Promise<Queue> {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.redisConnection,
      })
      await queue.waitUntilReady()
      this.queues.set(queueName, queue)

      this.logger.info(`${queueName}`, 'Queue created')
    }
    return this.queues.get(queueName)!
  }

  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down event manager')

    const shutdownPromises = Array.from(this.queues.values()).map((queue) =>
      queue.close()
    )

    await Promise.all(shutdownPromises)
    this.queues.clear()

    this.logger.info('Event manager shutdown complete')
  }

  // Singleton instance
  private static instance: EventManager | null = null

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager()
    }
    return EventManager.instance
  }
}
