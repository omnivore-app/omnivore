/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import { Subscription } from '../../entity/subscription'
import { getRepository } from '../../entity/utils'
import { SubscriptionStatus, SubscriptionType } from '../../generated/graphql'
import { enqueueRssFeedFetch } from '../../utils/createTask'
import { buildLogger } from '../../utils/logger'

const logger = buildLogger('app.dispatch')

export function rssFeedRouter() {
  const router = express.Router()

  router.post('/fetchAll', async (req, res) => {
    logger.info('fetch all rss feeds')

    const { message: msgStr, expired } = readPushSubscription(req)
    logger.info('read pubsub message', msgStr, 'has expired', expired)

    if (expired) {
      logger.info('discarding expired message')
      return res.status(200).send('Expired')
    }

    try {
      // get all active rss feed subscriptions
      const subscriptions = await getRepository(Subscription).find({
        select: ['id', 'url', 'user', 'lastFetchedAt'],
        where: {
          type: SubscriptionType.Rss,
          status: SubscriptionStatus.Active,
        },
        relations: ['user'],
      })

      // create a cloud taks to fetch rss feed item for each subscription
      await Promise.all(
        subscriptions.map((subscription) => {
          try {
            return enqueueRssFeedFetch(subscription.user.id, subscription)
          } catch (error) {
            logger.info('error creating rss feed fetch task', error)
          }
        })
      )

      res.send('OK')
    } catch (error) {
      logger.info('error fetching rss feeds', error)
      res.status(500).send('Internal Server Error')
    }
  })

  return router
}
