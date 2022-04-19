import { authorized } from '../../utils/helpers'
import {
  SubscriptionsError,
  SubscriptionsErrorCode,
  SubscriptionsSuccess,
  SubscriptionStatus,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'

export const subscriptionsResolver = authorized<
  SubscriptionsSuccess,
  SubscriptionsError
>(async (_obj, _params, { claims: { uid }, log }) => {
  log.info('subscriptionsResolver')

  analytics.track({
    userId: uid,
    event: 'subscriptions',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    const user = await getRepository(User).findOne({
      where: { id: uid, subscriptions: { status: SubscriptionStatus.Active } },
      relations: {
        subscriptions: true,
      },
      order: {
        subscriptions: {
          createdAt: 'DESC',
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
