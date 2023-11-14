import Parser from 'rss-parser'
import { Brackets } from 'typeorm'
import { Subscription } from '../../entity/subscription'
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
import { getRepository } from '../../repository'
import { unsubscribe } from '../../services/subscriptions'
import { Merge } from '../../util'
import { analytics } from '../../utils/analytics'
import { enqueueRssFeedFetch } from '../../utils/createTask'
import { authorized } from '../../utils/helpers'

type PartialSubscription = Omit<Subscription, 'newsletterEmail'>

const parser = new Parser({
  timeout: 30000, // 30 seconds
  maxRedirects: 5,
  headers: {
    // some rss feeds require user agent
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    Accept:
      'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4',
  },
})

export type SubscriptionsSuccessPartial = Merge<
  SubscriptionsSuccess,
  { subscriptions: PartialSubscription[] }
>
export const subscriptionsResolver = authorized<
  SubscriptionsSuccessPartial,
  SubscriptionsError,
  QuerySubscriptionsArgs
>(async (_obj, { sort, type }, { uid, log }) => {
  try {
    const sortBy =
      sort?.by === SortBy.UpdatedTime ? 'lastFetchedAt' : 'createdAt'
    const sortOrder = sort?.order === SortOrder.Ascending ? 'ASC' : 'DESC'

    const queryBuilder = getRepository(Subscription)
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.newsletterEmail', 'newsletterEmail')
      .where({
        user: { id: uid },
      })

    if (type && type == SubscriptionType.Newsletter) {
      queryBuilder.andWhere({
        type,
        status: SubscriptionStatus.Active,
      })
    } else if (type && type == SubscriptionType.Rss) {
      queryBuilder.andWhere({
        type,
      })
    } else {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where({
            type: SubscriptionType.Newsletter,
            status: SubscriptionStatus.Active,
          }).orWhere({
            type: SubscriptionType.Rss,
          })
        })
      )
    }

    const subscriptions = await queryBuilder
      .orderBy('subscription.status', 'ASC')
      .addOrderBy(`subscription.${sortBy}`, sortOrder, 'NULLS LAST')
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
})

export type UnsubscribeSuccessPartial = Merge<
  UnsubscribeSuccess,
  { subscription: PartialSubscription }
>
export const unsubscribeResolver = authorized<
  UnsubscribeSuccessPartial,
  UnsubscribeError,
  MutationUnsubscribeArgs
>(async (_, { name, subscriptionId }, { uid, log }) => {
  log.info('unsubscribeResolver')

  try {
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
>(async (_, { input }, { authTrx, uid, log }) => {
  try {
    analytics.track({
      userId: uid,
      event: 'subscribed',
      properties: {
        ...input,
        env: env.server.apiEnv,
      },
    })

    // find existing subscription
    const existingSubscription = await getRepository(Subscription).findOneBy({
      url: input.url,
      user: { id: uid },
      type: SubscriptionType.Rss,
    })
    if (existingSubscription) {
      if (existingSubscription.status === SubscriptionStatus.Active) {
        return {
          errorCodes: [SubscribeErrorCode.AlreadySubscribed],
        }
      }

      // re-subscribe
      const updatedSubscription = await getRepository(Subscription).save({
        ...existingSubscription,
        status: SubscriptionStatus.Active,
      })

      // create a cloud task to fetch rss feed item for resub subscription
      await enqueueRssFeedFetch({
        userIds: [uid],
        url: input.url,
        subscriptionIds: [updatedSubscription.id],
        scheduledDates: [new Date()], // fetch immediately
        fetchedDates: [updatedSubscription.lastFetchedAt || null],
        checksums: [updatedSubscription.lastFetchedChecksum || null],
        addToLibraryFlags: [!!updatedSubscription.autoAddToLibrary],
      })

      return {
        subscriptions: [updatedSubscription],
      }
    }

    // create new rss subscription
    const MAX_RSS_SUBSCRIPTIONS = 150
    // validate rss feed
    const feed = await parser.parseURL(input.url)

    // limit number of rss subscriptions to 150
    const results = (await getRepository(Subscription).query(
      `insert into omnivore.subscriptions (name, url, description, type, user_id, icon, auto_add_to_library, is_private) 
          select $1, $2, $3, $4, $5, $6, $7, $8 from omnivore.subscriptions 
          where user_id = $5 and type = 'RSS' and status = 'ACTIVE' 
          having count(*) < $9
          returning *;`,
      [
        feed.title,
        feed.feedUrl,
        feed.description || null,
        SubscriptionType.Rss,
        uid,
        feed.image?.url || null,
        input.autoAddToLibrary ?? null,
        input.isPrivate ?? null,
        MAX_RSS_SUBSCRIPTIONS,
      ]
    )) as Subscription[]

    if (results.length === 0) {
      return {
        errorCodes: [SubscribeErrorCode.ExceededMaxSubscriptions],
      }
    }

    const newSubscription = results[0]

    // create a cloud task to fetch rss feed item for the new subscription
    await enqueueRssFeedFetch({
      userIds: [uid],
      url: input.url,
      subscriptionIds: [newSubscription.id],
      scheduledDates: [new Date()], // fetch immediately
      fetchedDates: [null],
      checksums: [null],
      addToLibraryFlags: [!!newSubscription.autoAddToLibrary],
    })

    return {
      subscriptions: [newSubscription],
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
>(async (_, { input }, { authTrx, uid, log }) => {
  try {
    analytics.track({
      userId: uid,
      event: 'update_subscription',
      properties: {
        ...input,
        env: env.server.apiEnv,
      },
    })

    const updatedSubscription = await authTrx(async (t) => {
      const repo = t.getRepository(Subscription)

      // update subscription
      await t.getRepository(Subscription).save({
        id: input.id,
        name: input.name || undefined,
        description: input.description || undefined,
        lastFetchedAt: input.lastFetchedAt
          ? new Date(input.lastFetchedAt)
          : undefined,
        lastFetchedChecksum: input.lastFetchedChecksum || undefined,
        status: input.status || undefined,
        scheduledAt: input.scheduledAt
          ? new Date(input.scheduledAt)
          : undefined,
        autoAddToLibrary: input.autoAddToLibrary ?? undefined,
        isPrivate: input.isPrivate ?? undefined,
      })

      return repo.findOneByOrFail({
        id: input.id,
        user: { id: uid },
      })
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
