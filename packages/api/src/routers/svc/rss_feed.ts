/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import {
  DEFAULT_SUBSCRIPTION_FOLDER,
  Subscription,
} from '../../entity/subscription'
import { SubscriptionStatus, SubscriptionType } from '../../generated/graphql'
import { readPushSubscription } from '../../pubsub'
import { getRepository } from '../../repository'
import {
  enqueueRssFeedFetch,
  RssSubscriptionGroup,
} from '../../utils/createTask'
import { logger } from '../../utils/logger'
import { queueRSSRefreshAllFeedsJob } from '../../jobs/rss/refreshAllFeeds'
import { redisDataSource } from '../../redis_data_source'

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

      if (redisDataSource.workerRedisClient) {
        await queueRSSRefreshAllFeedsJob()
      } else {
        console.log('unable to fetchAll feeds, redis is not configured')
        return res.status(500).send('Expired')
      }
    } catch (error) {
      logger.info('error fetching rss feeds', error)
      return res.status(500).send('Internal Server Error')
    }

    res.send('OK')
  })

  return router
}
