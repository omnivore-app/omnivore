/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { queueRSSRefreshAllFeedsJob } from '../../jobs/rss/refreshAllFeeds'
import { readPushSubscription } from '../../pubsub'
import { redisDataSource } from '../../redis_data_source'
import { logger } from '../../utils/logger'

export function rssFeedRouter(): express.Router {
  const router = express.Router()

  router.post(
    '/fetchAll',
    async (req: express.Request, res: express.Response): Promise<void> => {
      logger.info('fetch all rss feeds')

      try {
        const { message: msgStr, expired } = readPushSubscription(req)
        logger.info(`read pubsub message`, { msgStr, expired })

        if (expired) {
          logger.info('discarding expired message')
          res.status(200).send('Expired')
          return
        }

        if (redisDataSource.workerRedisClient) {
          await queueRSSRefreshAllFeedsJob()
        } else {
          logger.info('unable to fetchAll feeds, redis is not configured')
          res.status(500).send('Expired')
          return
        }
      } catch (error) {
        logger.error('error fetching rss feeds', error)
        res.status(500).send('Internal Server Error')
      }

      res.send('OK')
    }
  )

  return router
}
