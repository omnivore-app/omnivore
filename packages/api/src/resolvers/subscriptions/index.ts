import Parser from 'rss-parser'
import { Subscription } from '../../entity/subscription'
import { User } from '../../entity/user'
import { getRepository } from '../../entity/utils'
import { env } from '../../env'
import {
  MutationSubscribeArgs,
  MutationUnsubscribeArgs,
  MutationUpdateSubscriptionArgs,
  QuerySubscriptionsArgs,
  SortBy,
  SortOrder,
  SubscribeError,
  SubscribeErrorCode,
  SubscribeSuccess,
  SubscriptionsError,
  SubscriptionsErrorCode,
  SubscriptionsSuccess,
  SubscriptionStatus,
  SubscriptionType,
  UnsubscribeError,
  UnsubscribeErrorCode,
  UnsubscribeSuccess,
  UpdateSubscriptionError,
  UpdateSubscriptionErrorCode,
  UpdateSubscriptionSuccess,
} from '../../generated/graphql'
import { AppDataSource } from '../../server'
import { getSubscribeHandler, unsubscribe } from '../../services/subscriptions'
import { Merge } from '../../util'
import { analytics } from '../../utils/analytics'
import { enqueueRssFeedFetch } from '../../utils/createTask'
import { authorized } from '../../utils/helpers'

type PartialSubscription = Omit<Subscription, 'newsletterEmail'>

const parser = new Parser({
  timeout: 30000, // 30 seconds
  maxRedirects: 5,
})

export type SubscriptionsSuccessPartial = Merge<
  SubscriptionsSuccess,
  { subscriptions: PartialSubscription[] }
>
export const subscriptionsResolver = authorized<
  SubscriptionsSuccessPartial,
  SubscriptionsError,
  QuerySubscriptionsArgs
>(
  async (
    _obj,
    { sort, type },
    { claims: { uid }, log }
  ) => {
    log.info('subscriptionsResolver')

    analytics.track({
      userId: uid,
      event: 'subscriptions',
      properties: {
        env: env.server.apiEnv,
      },
    })

    try {
      const sortBy =
        sort?.by === SortBy.UpdatedTime ? 'lastFetchedAt' : 'createdAt'
      const sortOrder = sort?.order === SortOrder.Ascending ? 'ASC' : 'DESC'
      const user = await getRepository(User).findOneBy({ id: uid })
      if (!user) {
        return {
          errorCodes: [SubscriptionsErrorCode.Unauthorized],
        }
      }

      const queryBuilder = getRepository(Subscription)
        .createQueryBuilder('subscription')
        .leftJoinAndSelect('subscription.newsletterEmail', 'newsletterEmail')
        .where({
          user: { id: uid },
          type,
        })

      // only return active subscriptions for newsletter
      if (type === SubscriptionType.Newsletter) {
        queryBuilder.andWhere({ status: SubscriptionStatus.Active })
      }

      const subscriptions = await queryBuilder
        .orderBy('subscription.' + sortBy, sortOrder)
        .getMany()

      return {
        subscriptions,
      }
    } catch (error) {
      log.error(error)
      return {
        errorCodes: [SubscriptionsErrorCode.BadRequest],
      }
    }
  }
)

export type UnsubscribeSuccessPartial = Merge<
  UnsubscribeSuccess,
  { subscription: PartialSubscription }
>
export const unsubscribeResolver = authorized<
  UnsubscribeSuccessPartial,
  UnsubscribeError,
  MutationUnsubscribeArgs
>(async (_, { name, subscriptionId }, { claims: { uid }, log }) => {
  log.info('unsubscribeResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [UnsubscribeErrorCode.Unauthorized],
      }
    }

    const queryBuilder = getRepository(Subscription)
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.newsletterEmail', 'newsletterEmail')
      .where({ user: { id: uid } })

    if (subscriptionId) {
      // if subscriptionId is provided, ignore name
      queryBuilder.andWhere({ id: subscriptionId })
    } else {
      // if subscriptionId is not provided, use name for old clients
      queryBuilder.andWhere({ name })
    }

    const subscription = await queryBuilder.getOne()
    if (!subscription) {
      return {
        errorCodes: [UnsubscribeErrorCode.NotFound],
      }
    }

    // if subscription is already unsubscribed, throw error
    if (subscription.status === SubscriptionStatus.Unsubscribed) {
      return {
        errorCodes: [UnsubscribeErrorCode.AlreadyUnsubscribed],
      }
    }

    if (
      subscription.type === SubscriptionType.Newsletter &&
      !subscription.unsubscribeMailTo &&
      !subscription.unsubscribeHttpUrl
    ) {
      log.info('No unsubscribe method found for newsletter subscription')
    }

    await unsubscribe(subscription)

    analytics.track({
      userId: uid,
      event: 'unsubscribed',
      properties: {
        name,
        env: env.server.apiEnv,
      },
    })

    return {
      subscription,
    }
  } catch (error) {
    log.error('failed to unsubscribe', error)
    return {
      errorCodes: [UnsubscribeErrorCode.BadRequest],
    }
  }
})

export type SubscribeSuccessPartial = Merge<
  SubscribeSuccess,
  { subscriptions: PartialSubscription[] }
>
export const subscribeResolver = authorized<
  SubscribeSuccessPartial,
  SubscribeError,
  MutationSubscribeArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('subscribeResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [SubscribeErrorCode.Unauthorized],
      }
    }

    // find existing subscription
    const subscription = await getRepository(Subscription).findOneBy({
      url: input.url || undefined,
      name: input.name || undefined,
      user: { id: uid },
      status: SubscriptionStatus.Active,
      type: input.subscriptionType || SubscriptionType.Rss, // default to rss
    })
    if (subscription) {
      return {
        errorCodes: [SubscribeErrorCode.AlreadySubscribed],
      }
    }

    analytics.track({
      userId: uid,
      event: 'subscribed',
      properties: {
        ...input,
        env: env.server.apiEnv,
      },
    })

    // create new newsletter subscription
    if (input.name && input.subscriptionType === SubscriptionType.Newsletter) {
      const subscribeHandler = getSubscribeHandler(input.name)
      if (!subscribeHandler) {
        return {
          errorCodes: [SubscribeErrorCode.NotFound],
        }
      }

      const newSubscriptions = await subscribeHandler.handleSubscribe(
        uid,
        input.name
      )
      if (!newSubscriptions) {
        return {
          errorCodes: [SubscribeErrorCode.BadRequest],
        }
      }

      return {
        subscriptions: newSubscriptions,
      }
    }

    // create new rss subscription
    if (input.url) {
      const MAX_RSS_SUBSCRIPTIONS = 150
      // validate rss feed
      const feed = await parser.parseURL(input.url)

      // limit number of rss subscriptions to 50
      const newSubscriptions = (await AppDataSource.query(
        `insert into omnivore.subscriptions (name, url, description, type, user_id, icon) 
        select $1, $2, $3, $4, $5, $6 from omnivore.subscriptions 
        where user_id = $5 and type = 'RSS' and status = 'ACTIVE' 
        having count(*) < $7 
        returning *;`,
        [
          feed.title,
          input.url,
          feed.description || null,
          SubscriptionType.Rss,
          uid,
          feed.image?.url || null,
          MAX_RSS_SUBSCRIPTIONS,
        ]
      )) as Subscription[]

      if (newSubscriptions.length === 0) {
        return {
          errorCodes: [SubscribeErrorCode.ExceededMaxSubscriptions],
        }
      }

      // create a cloud task to fetch rss feed item for the new subscription
      await enqueueRssFeedFetch(uid, newSubscriptions[0])

      return {
        subscriptions: newSubscriptions,
      }
    }

    log.info('missing url or name')
    return {
      errorCodes: [SubscribeErrorCode.BadRequest],
    }
  } catch (error) {
    log.error('failed to subscribe', error)
    if (error instanceof Error && error.message === 'Status code 404') {
      return {
        errorCodes: [SubscribeErrorCode.NotFound],
      }
    }
    return {
      errorCodes: [SubscribeErrorCode.BadRequest],
    }
  }
})

export type UpdateSubscriptionSuccessPartial = Merge<
  UpdateSubscriptionSuccess,
  { subscription: PartialSubscription }
>
export const updateSubscriptionResolver = authorized<
  UpdateSubscriptionSuccessPartial,
  UpdateSubscriptionError,
  MutationUpdateSubscriptionArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('updateSubscriptionResolver')

  try {
    analytics.track({
      userId: uid,
      event: 'update_subscription',
      properties: {
        ...input,
        env: env.server.apiEnv,
      },
    })

    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [UpdateSubscriptionErrorCode.Unauthorized],
      }
    }

    // find existing subscription
    const subscription = await getRepository(Subscription).findOneBy({
      id: input.id,
      user: { id: uid },
    })
    if (!subscription) {
      log.info('subscription not found')
      return {
        errorCodes: [UpdateSubscriptionErrorCode.NotFound],
      }
    }

    // update subscription
    const updatedSubscription = await getRepository(Subscription).save({
      id: input.id,
      name: input.name || undefined,
      description: input.description || undefined,
      lastFetchedAt: input.lastFetchedAt
        ? new Date(input.lastFetchedAt)
        : undefined,
      status: input.status || undefined,
    })

    return {
      subscription: updatedSubscription,
    }
  } catch (error) {
    log.error('failed to update subscription', error)
    return {
      errorCodes: [UpdateSubscriptionErrorCode.BadRequest],
    }
  }
})
