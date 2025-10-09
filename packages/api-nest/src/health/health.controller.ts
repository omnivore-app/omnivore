import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { RedisHealthIndicator } from './redis-health.indicator'
import { QueueHealthIndicator } from '../queue/queue-health.indicator'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private queue: QueueHealthIndicator,
  ) {}

  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Basic health check - just return healthy
      () =>
        Promise.resolve({
          'basic-check': { status: 'up', timestamp: new Date().toISOString() },
        }),
    ])
  }

  @ApiOperation({ summary: 'Deep health check with dependencies' })
  @ApiResponse({
    status: 200,
    description: 'Deep health check results',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            'deep-check': {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                timestamp: {
                  type: 'string',
                  example: '2023-09-25T15:30:00.000Z',
                },
                checks: {
                  type: 'object',
                  properties: {
                    database: { type: 'string', example: 'up' },
                    redis: { type: 'string', example: 'up' },
                  },
                },
              },
            },
          },
        },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  @Get('deep')
  @HealthCheck()
  deepCheck() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),
      // Redis health check
      () => this.redis.isHealthy('redis'),
      // Queue health check
      () => this.queue.isHealthy('queues'),
      // System health check
      () => this.getSystemHealth(),
    ])
  }

  @ApiOperation({ summary: 'Comprehensive health check with metrics' })
  @Get('full')
  @HealthCheck()
  fullCheck() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),
      // Redis health check
      () => this.redis.isHealthy('redis'),
      // Queue health check
      () => this.queue.isHealthy('queues'),
      // System health check
      () => this.getSystemHealth(),
      // Application health check
      () => this.getApplicationHealth(),
    ])
  }

  private async getSystemHealth(): Promise<{ [key: string]: any }> {
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()

    return {
      system: {
        status: 'up',
        uptime: Math.floor(uptime),
        uptimeHuman: this.formatUptime(uptime),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
    }
  }

  private async getApplicationHealth(): Promise<{ [key: string]: any }> {
    return {
      application: {
        status: 'up',
        name: 'omnivore-api-nest',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        features: {
          authentication: 'enabled',
          emailVerification: 'enabled',
          analytics:
            process.env.ANALYTICS_ENABLED === 'true' ? 'enabled' : 'disabled',
          pubsub:
            process.env.PUBSUB_ENABLED === 'true' ? 'enabled' : 'disabled',
          intercom:
            process.env.INTERCOM_ENABLED === 'true' ? 'enabled' : 'disabled',
        },
      },
    }
  }

  private formatUptime(uptimeSeconds: number): string {
    const days = Math.floor(uptimeSeconds / 86400)
    const hours = Math.floor((uptimeSeconds % 86400) / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const seconds = Math.floor(uptimeSeconds % 60)

    const parts: string[] = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (seconds > 0) parts.push(`${seconds}s`)

    return parts.join(' ') || '0s'
  }
}
