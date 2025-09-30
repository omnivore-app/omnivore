import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from '../config/env-variables'

export interface UserCreatedEvent {
  userId: string
  email: string
  name: string
  username: string
}

export interface PubSubClient {
  userCreated(
    userId: string,
    email: string,
    name: string,
    username: string,
  ): Promise<void>
  entityCreated<T extends { id: string }>(
    type: EntityType,
    data: T,
    userId: string,
  ): Promise<void>
  entityUpdated<T extends { id: string }>(
    type: EntityType,
    data: T,
    userId: string,
  ): Promise<void>
  entityDeleted(type: EntityType, id: string, userId: string): Promise<void>
}

export enum EntityType {
  ITEM = 'PAGE',
  HIGHLIGHT = 'HIGHLIGHT',
  LABEL = 'LABEL',
  RSS_FEED = 'FEED',
}

@Injectable()
export class PubSubService implements PubSubClient {
  private readonly logger = new Logger(PubSubService.name)
  private readonly enabled: boolean
  private readonly isLocal: boolean

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('PUBSUB_ENABLED', false)
    this.isLocal =
      this.configService.get<string>(EnvVariables.NODE_ENV) === 'development'
  }

  async userCreated(
    userId: string,
    email: string,
    name: string,
    username: string,
  ): Promise<void> {
    const eventData: UserCreatedEvent = { userId, email, name, username }

    if (this.isLocal || !this.enabled) {
      this.logger.log(`PubSub Event: userCreated`, {
        topic: 'userCreated',
        data: eventData,
        service: 'pubsub',
      })
      return
    }

    try {
      // TODO: Integrate with actual Pub/Sub service (Google Cloud Pub/Sub, AWS SNS, etc.)
      // For now, log structured pub/sub events
      this.logger.log(`Publishing userCreated event`, {
        topic: 'userCreated',
        userId,
        email,
        name,
        username,
        implementation: 'STUB - needs Google Cloud Pub/Sub integration',
      })

      // In production, this would be:
      // await this.pubSubClient
      //   .topic('userCreated')
      //   .publishMessage({ data: Buffer.from(JSON.stringify(eventData)) })
    } catch (error) {
      this.logger.error('Failed to publish userCreated event', {
        error,
        userId,
        email,
      })
      // Don't throw - pub/sub failures shouldn't block user operations
    }
  }

  async entityCreated<T extends { id: string }>(
    type: EntityType,
    data: T,
    userId: string,
  ): Promise<void> {
    const eventData = {
      type,
      data,
      userId,
      timestamp: new Date().toISOString(),
    }

    if (this.isLocal || !this.enabled) {
      this.logger.log(`PubSub Event: entityCreated`, {
        topic: 'entityCreated',
        data: eventData,
        service: 'pubsub',
      })
      return
    }

    try {
      this.logger.log(`Publishing entityCreated event`, {
        topic: 'entityCreated',
        type,
        entityId: data.id,
        userId,
        implementation:
          'STUB - needs integration with rule triggers and job queues',
      })

      // In production, this would:
      // 1. Publish to pub/sub topic
      // 2. Trigger rule engine jobs
      // 3. Enqueue thumbnail generation for items
      // 4. Handle YouTube video processing
    } catch (error) {
      this.logger.error('Failed to publish entityCreated event', {
        error,
        type,
        entityId: data.id,
        userId,
      })
    }
  }

  async entityUpdated<T extends { id: string }>(
    type: EntityType,
    data: T,
    userId: string,
  ): Promise<void> {
    const eventData = {
      type,
      data,
      userId,
      timestamp: new Date().toISOString(),
    }

    if (this.isLocal || !this.enabled) {
      this.logger.debug(`PubSub Event: entityUpdated`, eventData)
      return
    }

    try {
      this.logger.log(`Publishing entityUpdated event`, {
        topic: 'entityUpdated',
        type,
        entityId: data.id,
        userId,
      })
    } catch (error) {
      this.logger.error('Failed to publish entityUpdated event', {
        error,
        type,
        entityId: data.id,
        userId,
      })
    }
  }

  async entityDeleted(
    type: EntityType,
    id: string,
    userId: string,
  ): Promise<void> {
    const eventData = {
      type,
      id,
      userId,
      timestamp: new Date().toISOString(),
    }

    if (this.isLocal || !this.enabled) {
      this.logger.debug(`PubSub Event: entityDeleted`, eventData)
      return
    }

    try {
      this.logger.log(`Publishing entityDeleted event`, {
        topic: 'entityDeleted',
        type,
        entityId: id,
        userId,
      })
    } catch (error) {
      this.logger.error('Failed to publish entityDeleted event', {
        error,
        type,
        entityId: id,
        userId,
      })
    }
  }
}
