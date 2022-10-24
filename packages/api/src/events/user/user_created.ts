import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'

import { Profile } from '../../entity/profile'
import { IntercomClient } from '../../utils/intercom'
import { createPubSubClient } from '../../datalayer/pubsub'
import { env } from '../../env'
import { analytics } from '../../utils/analytics'
import { addPopularReadsForNewUser } from '../../services/popular_reads'

@EventSubscriber()
export class CreateIntercomAccount
  implements EntitySubscriberInterface<Profile>
{
  listenTo() {
    return Profile
  }

  async afterInsert(event: InsertEvent<Profile>): Promise<void> {
    const profile = event.entity

    const customAttributes: { source_user_id: string } = {
      source_user_id: profile.user.sourceUserId,
    }
    await IntercomClient?.contacts.createUser({
      email: profile.user.email,
      externalId: profile.user.id,
      name: profile.user.name,
      avatar: profile.pictureUrl,
      customAttributes: customAttributes,
      signedUpAt: Math.floor(Date.now() / 1000),
    })
  }
}

@EventSubscriber()
export class IdentifySegmentUser implements EntitySubscriberInterface<Profile> {
  listenTo() {
    return Profile
  }

  afterInsert(event: InsertEvent<Profile>): Promise<void> {
    try {
      const profile = event.entity

      analytics.identify({
        userId: profile.user.id,
        traits: {
          name: profile.user.name,
          email: profile.user.email,
          source: profile.user.source,
          env: env.server.apiEnv,
        },
      })
    } catch (error) {
      console.log('error in sign up', error)
    }
    return Promise.resolve()
  }
}

@EventSubscriber()
export class PublishNewUserEvent implements EntitySubscriberInterface<Profile> {
  listenTo() {
    return Profile
  }

  async afterInsert(event: InsertEvent<Profile>): Promise<void> {
    const client = createPubSubClient()
    await client.userCreated(
      event.entity.user.id,
      event.entity.user.email,
      event.entity.user.name,
      event.entity.username
    )
  }
}

@EventSubscriber()
export class AddPopularReadsToNewUser
  implements EntitySubscriberInterface<Profile>
{
  listenTo() {
    return Profile
  }

  async afterInsert(event: InsertEvent<Profile>): Promise<void> {
    await addPopularReadsForNewUser(event.entity.user.id)
  }
}
