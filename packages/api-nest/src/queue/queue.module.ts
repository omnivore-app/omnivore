/**
 * QueueModule - BullMQ Queue Configuration
 *
 * Sets up BullMQ with Redis Sentinel support for background job processing.
 * Configures queues for content processing, notifications, and post-processing.
 */

import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { QUEUE_NAMES, REDIS_CONFIG } from './queue.constants'
import { EventBusService } from './event-bus.service'
import { QueueHealthIndicator } from './queue-health.indicator'
import { ContentProcessorService } from './processors/content-processor.service'
import { LibraryItemEntity } from '../library/entities/library-item.entity'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([LibraryItemEntity]),
    // Register BullMQ with Redis Sentinel configuration
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Check if we're using Sentinel (production) or standalone Redis (development)
        const useSentinel =
          configService.get<string>('NODE_ENV') === 'production' &&
          REDIS_CONFIG.SENTINELS

        return {
          connection: useSentinel
            ? {
                // Sentinel configuration (production)
                sentinels: REDIS_CONFIG.SENTINELS,
                name: REDIS_CONFIG.SENTINEL_NAME,
                password: REDIS_CONFIG.PASSWORD,
                maxRetriesPerRequest: REDIS_CONFIG.MAX_RETRIES_PER_REQUEST,
                enableReadyCheck: REDIS_CONFIG.ENABLE_READY_CHECK,
                enableOfflineQueue: REDIS_CONFIG.ENABLE_OFFLINE_QUEUE,
              }
            : {
                // Standalone Redis configuration (development)
                host: REDIS_CONFIG.HOST,
                port: REDIS_CONFIG.PORT,
                password: REDIS_CONFIG.PASSWORD,
                maxRetriesPerRequest: REDIS_CONFIG.MAX_RETRIES_PER_REQUEST,
                enableReadyCheck: REDIS_CONFIG.ENABLE_READY_CHECK,
                enableOfflineQueue: REDIS_CONFIG.ENABLE_OFFLINE_QUEUE,
              },
          prefix: REDIS_CONFIG.KEY_PREFIX,
          defaultJobOptions: {
            removeOnComplete: {
              age: 86400, // Keep completed jobs for 24 hours
              count: 1000, // Keep last 1000 completed jobs
            },
            removeOnFail: {
              age: 604800, // Keep failed jobs for 7 days
              count: 5000, // Keep last 5000 failed jobs
            },
          },
        }
      },
    }),

    // Register individual queues
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.CONTENT_PROCESSING,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: QUEUE_NAMES.NOTIFICATIONS,
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      },
      {
        name: QUEUE_NAMES.POST_PROCESSING,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
        },
      }
    ),
  ],
  providers: [EventBusService, QueueHealthIndicator, ContentProcessorService],
  exports: [BullModule, EventBusService, QueueHealthIndicator],
})
export class QueueModule {}
