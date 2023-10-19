/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { Subscription } from '../../entity/subscription'
import { SubscriptionStatus, SubscriptionType } from '../../generated/graphql'
import { readPushSubscription } from '../../pubsub'
import { getRepository } from '../../repository'
import {
  enqueueRssFeedFetch,
  RssSubscriptionGroup,
} from '../../utils/createTask'
import { logger } from '../../utils/logger'

export function rssFeedRouter() {
  const router = express.Router()

  router.post('/fetchAll', async (req, res) => {
    logger.info('fetch all rss feeds')

    try {
      const { message: msgStr, expired } = readPushSubscription(req)
      logger.info(`read pubsub message`, { msgStr, expired })

      if (expired) {
        logger.info('discarding expired message')
        return res.status(200).send('Expired')
      }

      // get active rss feed subscriptions scheduled for fetch and group by feed url
      const subscriptionGroups = (await getRepository(Subscription).query(
        `
        SELECT
          url,
          ARRAY_AGG(id) AS subscription_ids,
          ARRAY_AGG(user_id) AS user_ids,
          ARRAY_AGG(last_fetched_at) AS last_fetched_timestamps,
          ARRAY_AGG(scheduled_at) AS scheduled_timestamps
        FROM
          omnivore.subscriptions
        WHERE
          type = $1
          AND status = $2
          AND (scheduled_at <= NOW() OR scheduled_at IS NULL)
        GROUP BY
          url
        `,
        [SubscriptionType.Rss, SubscriptionStatus.Active]
      )) as RssSubscriptionGroup[]

      logger.info('scheduledSubscriptions', subscriptionGroups)

      // create a cloud taks to fetch rss feed item for each subscription
      await Promise.all(
        subscriptionGroups.map((subscriptionGroup) => {
          try {
            return enqueueRssFeedFetch(subscriptionGroup)
          } catch (error) {
            logger.info('error creating rss feed fetch task', error)
          }
        })
      )
    } catch (error) {
      logger.info('error fetching rss feeds', error)
      return res.status(500).send('Internal Server Error')
    }

    res.send('OK')
  })

  return router
}
