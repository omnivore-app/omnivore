import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { ConfigModule } from '@nestjs/config'
import { HealthController } from './health.controller'
import { RedisHealthIndicator } from './redis-health.indicator'

@Module({
  imports: [TerminusModule, ConfigModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
