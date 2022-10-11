import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'

import { Profile } from '../../entity/profile'
import { Follower } from '../../entity/follower'
import { IntercomClient } from '../../utils/intercom'
import { createPubSubClient } from '../../datalayer/pubsub'
import { env } from '../../env'
import { analytics } from '../../utils/analytics'
import { addPopularReadsForNewUser } from '../../services/popular_reads'

@EventSubscriber()
export class FollowOmnivoreUser implements EntitySubscriberInterface<Profile> {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  listenTo() {
    return Profile
  }

  async afterInsert(event: InsertEvent<Profile>): Promise<void> {
    const OMNIVORE_USER = 'hello'
    const omnivoreProfile = await event.manager.getRepository(Profile).findOne({
      where: { username: OMNIVORE_USER },
      relations: ['user'],
    })

    if (!omnivoreProfile) {
      console.log('unable to find omnivore hello user')
      return
    }

    await event.manager
      .getRepository(Follower)
      .save({ user: event.entity.user, followee: omnivoreProfile.user })

    await event.manager.query(
      `insert into omnivore.links (user_id, article_id, article_url, article_hash, slug)
        select $1, article_id, article_url, article_hash, slug
        from omnivore.links l where l.user_id = $2
        `,
      [event.entity.user.id, omnivoreProfile.user.id]
    )
  }
}

@EventSubscriber()
export class CreateIntercomAccount
  implements EntitySubscriberInterface<Profile>
{
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  listenTo() {
    return Profile
  }

  async afterInsert(event: InsertEvent<Profile>): Promise<void> {
    const isIOSUser = event.entity.user.source === 'APPLE'
    await addPopularReadsForNewUser(event.entity.user.id, isIOSUser)
  }
}
