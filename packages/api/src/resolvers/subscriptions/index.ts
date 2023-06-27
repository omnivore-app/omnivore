import { ILike } from 'typeorm'
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
  UnsubscribeError,
  UnsubscribeErrorCode,
  UnsubscribeSuccess,
} from '../../generated/graphql'
import { getSubscribeHandler, unsubscribe } from '../../services/subscriptions'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/helpers'
import { createImageProxyUrl } from '../../utils/imageproxy'

export const subscriptionsResolver = authorized<
  SubscriptionsSuccess,
  SubscriptionsError,
  QuerySubscriptionsArgs
>(async (_obj, { sort }, { claims: { uid }, log }) => {
  log.info('subscriptionsResolver')

  analytics.track({
    userId: uid,
    event: 'subscriptions',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    const sortBy = sort?.by === SortBy.UpdatedTime ? 'updatedAt' : 'createdAt'
    const sortOrder = sort?.order === SortOrder.Ascending ? 'ASC' : 'DESC'
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [SubscriptionsErrorCode.Unauthorized],
      }
    }

    const subscriptions = await getRepository(Subscription)
      .createQueryBuilder('subscription')
      .innerJoinAndSelect('subscription.newsletterEmail', 'newsletterEmail')
      .where({
        user: { id: uid },
        status: SubscriptionStatus.Active,
      })
      .orderBy('subscription.' + sortBy, sortOrder)
      .getMany()

    return {
      subscriptions: subscriptions.map((s) => ({
        ...s,
        icon: s.icon && createImageProxyUrl(s.icon, 128, 128),
        newsletterEmail: s.newsletterEmail.address,
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
>(async (_, { name }, { claims: { uid }, log }) => {
  log.info('unsubscribeResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [UnsubscribeErrorCode.Unauthorized],
      }
    }

    const subscription = await getRepository(Subscription)
      .createQueryBuilder('subscription')
      .innerJoinAndSelect('subscription.newsletterEmail', 'newsletterEmail')
      .where({ user: { id: uid } })
      .andWhere('LOWER(name) = LOWER(:name)', { name }) // case insensitive
      .getOne()

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
        newsletterEmail: subscription.newsletterEmail.address,
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
>(async (_, { name }, { claims: { uid }, log }) => {
  log.info('subscribeResolver')

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [SubscribeErrorCode.Unauthorized],
      }
    }

    const subscription = await getRepository(Subscription).findOneBy({
      name: ILike(name),
      user: { id: uid },
      status: SubscriptionStatus.Active,
    })
    if (subscription) {
      return {
        errorCodes: [SubscribeErrorCode.AlreadySubscribed],
      }
    }

    const subscribeHandler = getSubscribeHandler(name)
    if (!subscribeHandler) {
      return {
        errorCodes: [SubscribeErrorCode.NotFound],
      }
    }

    const newSubscriptions = await subscribeHandler.handleSubscribe(uid, name)
    if (!newSubscriptions) {
      return {
        errorCodes: [SubscribeErrorCode.BadRequest],
      }
    }

    analytics.track({
      userId: uid,
      event: 'subscribed',
      properties: {
        name,
        env: env.server.apiEnv,
      },
    })

    return {
      subscriptions: newSubscriptions.map((s) => ({
        ...s,
        newsletterEmail: s.newsletterEmail.address,
      })),
    }
  } catch (error) {
    log.error('failed to subscribe', error)
    return {
      errorCodes: [SubscribeErrorCode.BadRequest],
    }
  }
})
