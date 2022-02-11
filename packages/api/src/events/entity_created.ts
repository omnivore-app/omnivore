/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { PubSub } from '@google-cloud/pubsub'

import {
  BaseEntity,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'

import { env } from '../env'

const TOPIC_NAME = 'EntityCreated'

@EventSubscriber()
export class PublishEntitySubscriber implements EntitySubscriberInterface {
  async afterInsert(event: InsertEvent<BaseEntity>): Promise<void> {
    const client = new PubSub()

    const msg = JSON.stringify({
      type: 'EntityCreated',
      entity: event.entity,
      entityClass: event.entity.constructor.name,
    })

    if (env.dev.isLocal) {
      console.log('PublishEntitySubscriber', msg)
      return
    }

    await client
      .topic(TOPIC_NAME)
      .publish(Buffer.from(msg))
      .catch((err) => {
        console.error('PublishEntitySubscriber error publishing event', err)
      })
  }
}
