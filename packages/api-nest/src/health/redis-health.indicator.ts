import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus'
import Redis from 'ioredis'
import { EnvVariables } from '../config/env-variables'

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name)
  private redis?: Redis

  constructor(private readonly configService: ConfigService) {
    super()
    this.initializeRedis()
  }

  private initializeRedis(): void {
    const redisUrl = this.configService.get<string>(EnvVariables.REDIS_URL)
    const nodeEnv = this.configService.get<string>(
      EnvVariables.NODE_ENV,
      'development',
    )

    // Only initialize Redis if URL is provided and not in test environment
    if (redisUrl && nodeEnv !== 'test') {
      try {
        const tlsCert = this.configService.get<string>(
          EnvVariables.REDIS_TLS_CERT,
        )

        this.redis = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          connectTimeout: 5000,
          tls: tlsCert
            ? {
                ca: tlsCert,
                rejectUnauthorized: false,
              }
            : undefined,
        })

        // Handle Redis connection events
        this.redis.on('error', (error) => {
          this.logger.warn('Redis connection error', error)
        })

        this.redis.on('connect', () => {
          this.logger.debug('Redis connected successfully')
        })
      } catch (error) {
        this.logger.error('Failed to initialize Redis client', error)
      }
    } else {
      this.logger.debug('Redis not configured or in test environment')
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const startTime = Date.now()

    try {
      if (!this.redis) {
        // Redis not configured - return healthy but with status info
        const result = this.getStatus(key, true, {
          status: 'not_configured',
          message: 'Redis URL not configured',
          responseTime: 0,
        })
        return result
      }

      // Test Redis connection with a simple ping
      const pingResult = await Promise.race([
        this.redis.ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000),
        ),
      ])

      const responseTime = Date.now() - startTime

      if (pingResult === 'PONG') {
        const result = this.getStatus(key, true, {
          status: 'up',
          message: 'Redis is responsive',
          responseTime,
        })
        return result
      } else {
        throw new Error(`Unexpected ping response: ${pingResult}`)
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('Redis health check failed', {
        error: errorMessage,
        responseTime,
      })

      const result = this.getStatus(key, false, {
        status: 'down',
        message: errorMessage,
        responseTime,
      })

      throw new HealthCheckError('Redis health check failed', result)
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit()
        this.logger.debug('Redis connection closed')
      } catch (error) {
        this.logger.warn('Error closing Redis connection', error)
      }
    }
  }
}
