import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { ConfigModule } from '@nestjs/config'
import { HealthController } from './health.controller'
import { RedisHealthIndicator } from './redis-health.indicator'
import { QueueModule } from '../queue/queue.module'

@Module({
  imports: [TerminusModule, ConfigModule, QueueModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
