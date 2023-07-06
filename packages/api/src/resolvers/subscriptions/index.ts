import Parser from 'rss-parser'
import { Subscription } from '../../entity/subscription'
import { User } from '../../entity/user'
import { getRepository } from '../../entity/utils'
import { env } from '../../env'
import {
  MutationSubscribeArgs,
  MutationUnsubscribeArgs,
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
} from '../../generated/graphql'
import { getSubscribeHandler, unsubscribe } from '../../services/subscriptions'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/helpers'
import { createImageProxyUrl } from '../../utils/imageproxy'

const parser = new Parser()

export const subscriptionsResolver = authorized<
  SubscriptionsSuccess,
  SubscriptionsError,
  QuerySubscriptionsArgs
>(async (_obj, { sort, type: subscriptionType }, { claims: { uid }, log }) => {
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

    const subscriptions = await getRepository(Subscription)
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.newsletterEmail', 'newsletterEmail')
      .where({
        user: { id: uid },
        status: SubscriptionStatus.Active,
        type: subscriptionType || SubscriptionType.Newsletter, // default to newsletter
      })
      .orderBy('subscription.' + sortBy, sortOrder)
      .getMany()

    return {
      subscriptions: subscriptions.map((s) => ({
        ...s,
        icon: s.icon && createImageProxyUrl(s.icon, 128, 128),
        newsletterEmail: s.newsletterEmail?.address,
      })),
    }
  } catch (error) {
    log.error(error)
    return {
      errorCodes: [SubscriptionsErrorCode.BadRequest],
    }
  }
})

export const unsubscribeResolver = authorized<
  UnsubscribeSuccess,
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

    if (!subscription.unsubscribeMailTo && !subscription.unsubscribeHttpUrl) {
      log.info('No unsubscribe method found')
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
      subscription: {
        ...subscription,
        newsletterEmail: subscription.newsletterEmail?.address,
      },
    }
  } catch (error) {
    log.error('failed to unsubscribe', error)
    return {
      errorCodes: [UnsubscribeErrorCode.BadRequest],
    }
  }
})

export const subscribeResolver = authorized<
  SubscribeSuccess,
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
        subscriptions: newSubscriptions.map((s) => ({
          ...s,
          newsletterEmail: s.newsletterEmail?.address,
        })),
      }
    }

    // create new rss subscription
    if (input.url) {
      // validate rss feed
      const feed = await parser.parseURL(input.url)

      const newSubscription = await getRepository(Subscription).save({
        name: feed.title,
        url: input.url,
        user: { id: uid },
        type: SubscriptionType.Rss,
        description: feed.description,
        icon: feed.image?.url,
      })

      return {
        subscriptions: [
          {
            ...newSubscription,
            newsletterEmail: null,
          },
        ],
      }
    }

    log.info('missing url or name')
    return {
      errorCodes: [SubscribeErrorCode.BadRequest],
    }
  } catch (error) {
    log.error('failed to subscribe', error)
    return {
      errorCodes: [SubscribeErrorCode.BadRequest],
    }
  }
})
