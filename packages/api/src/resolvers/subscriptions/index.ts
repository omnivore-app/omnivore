import { authorized } from '../../utils/helpers'
import {
  MutationUnsubscribeArgs,
  QuerySubscriptionsArgs,
  SortBy,
  SortOrder,
  SubscriptionsError,
  SubscriptionsErrorCode,
  SubscriptionsSuccess,
  SubscriptionStatus,
  UnsubscribeError,
  UnsubscribeErrorCode,
  UnsubscribeSuccess,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { Subscription } from '../../entity/subscription'
import { unsubscribe } from '../../services/subscriptions'

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
    const user = await getRepository(User).findOne({
      where: { id: uid, subscriptions: { status: SubscriptionStatus.Active } },
      relations: {
        subscriptions: true,
      },
      order: {
        subscriptions: {
          [sortBy]: sortOrder,
        },
      },
    })
    if (!user) {
      return {
        errorCodes: [SubscriptionsErrorCode.Unauthorized],
      }
    }

    return {
      subscriptions: user.subscriptions || [],
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
    const subscription = await getRepository(Subscription).findOneBy({
      name,
      user: { id: uid },
    })
    if (!subscription) {
      return {
        errorCodes: [UnsubscribeErrorCode.NotFound],
      }
    }

    if (subscription.user.id !== uid) {
      return {
        errorCodes: [UnsubscribeErrorCode.Unauthorized],
      }
    }

    // if subscription is already unsubscribed, throw error
    if (subscription.status === SubscriptionStatus.Unsubscribed) {
      return {
        errorCodes: [UnsubscribeErrorCode.AlreadyUnsubscribed],
      }
    }

    if (!subscription.unsubscribeMailTo && !subscription.unsubscribeHttpUrl) {
      return {
        errorCodes: [UnsubscribeErrorCode.UnsubscribeMethodNotFound],
      }
    }

    return { subscription: await unsubscribe(subscription) }
  } catch (error) {
    log.error('failed to unsubscribe', error)
    return {
      errorCodes: [UnsubscribeErrorCode.BadRequest],
    }
  }
})
