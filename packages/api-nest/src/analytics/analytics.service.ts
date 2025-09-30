import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from '../config/env-variables'

export interface AnalyticsEvent {
  distinctId: string
  event: string
  properties?: Record<string | number, any>
}

export interface AnalyticsClient {
  capture(event: AnalyticsEvent): void
  shutdownAsync?(): Promise<void>
}

@Injectable()
export class AnalyticsService implements AnalyticsClient {
  private readonly logger = new Logger(AnalyticsService.name)
  private readonly enabled: boolean
  private readonly environment: string

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('ANALYTICS_ENABLED', false)
    this.environment = this.configService.get<string>(
      EnvVariables.NODE_ENV,
      'development',
    )
  }

  capture({ distinctId, event, properties = {} }: AnalyticsEvent): void {
    const eventData = {
      distinctId,
      event,
      properties: {
        ...properties,
        env: this.environment,
        timestamp: new Date().toISOString(),
      },
    }

    if (this.enabled) {
      // TODO: Integrate with actual analytics service (PostHog, Mixpanel, etc.)
      // For now, log structured analytics events
      this.logger.log(`Analytics Event: ${event}`, {
        distinctId,
        event,
        properties: eventData.properties,
        service: 'analytics',
      })

      // In production, this would be:
      // await this.postHogClient.capture(eventData)
      // or
      // await this.mixpanelClient.track(event, { distinct_id: distinctId, ...properties })
    } else {
      this.logger.debug(`Analytics Event (disabled): ${event}`, eventData)
    }
  }

  /**
   * Track user registration event
   */
  trackUserCreated(
    userId: string,
    email: string,
    username: string,
    properties: Record<string, any> = {},
  ): void {
    this.capture({
      distinctId: userId,
      event: 'create_user',
      properties: {
        email,
        username,
        ...properties,
      },
    })
  }

  /**
   * Track user login event
   */
  trackUserLogin(userId: string, properties: Record<string, any> = {}): void {
    this.capture({
      distinctId: userId,
      event: 'user_login',
      properties,
    })
  }

  /**
   * Track email verification event
   */
  trackEmailVerified(
    userId: string,
    email: string,
    properties: Record<string, any> = {},
  ): void {
    this.capture({
      distinctId: userId,
      event: 'email_verified',
      properties: {
        email,
        ...properties,
      },
    })
  }

  async shutdownAsync(): Promise<void> {
    this.logger.log('Analytics service shutting down')
    // Flush any pending events
    return Promise.resolve()
  }
}
