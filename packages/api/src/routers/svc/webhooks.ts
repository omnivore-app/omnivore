/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios, { Method } from 'axios'
import express from 'express'
import { Webhook } from '../../entity/webhook'
import { readPushSubscription } from '../../pubsub'
import { authTrx } from '../../repository'
import { logger } from '../../utils/logger'

export function webhooksServiceRouter() {
  const router = express.Router()

  router.post('/trigger/:action', async (req, res) => {
    logger.info('trigger webhook of action', req.params.action)

    try {
      const { message: msgStr, expired } = readPushSubscription(req)

      if (!msgStr) {
        res.status(200).send('Bad Request')
        return
      }

      if (expired) {
        logger.info('discarding expired message')
        res.status(200).send('Expired')
        return
      }

      const data = JSON.parse(msgStr)
      const { userId, type } = data as { userId: string; type: string }
      if (!userId || !type) {
        logger.info('No userId or type found in message')
        res.status(200).send('Bad Request')
        return
      }

      // example: PAGE_CREATED
      const eventType = `${type}_${req.params.action}`.toUpperCase()
      const webhooks = await authTrx(
        (t) =>
          t
            .getRepository(Webhook)
            .createQueryBuilder()
            .where('user_id = :userId', { userId })
            .andWhere(':eventType = ANY(event_types)', { eventType })
            .andWhere('enabled = true')
            .getMany(),
        {
          uid: userId,
        }
      )

      if (webhooks.length <= 0) {
        logger.info(
          'No active webhook found for user ' +
            userId +
            ' and eventType ' +
            eventType
        )
        res.status(200).send('No webhook found')
        return
      }

      // trigger webhooks
      await Promise.all(
        webhooks.map((webhook) => {
          const url = webhook.url
          const method = webhook.method as Method
          const body = {
            action: req.params.action,
            userId,
            [type]: data,
          }

          logger.info('triggering webhook', { url, method })

          return axios
            .request({
              url,
              method,
              headers: {
                'Content-Type': webhook.contentType,
              },
              data: body,
              timeout: 10000, // 10s
            })
            .then((response) => {
              logger.info('webhook triggered', response.data)
            })
            .catch((error) => {
              if (axios.isAxiosError(error)) {
                logger.info('webhook failed', error.response)
              } else {
                logger.info('webhook failed', error)
              }
            })
        })
      )
    } catch (err) {
      logger.error('trigger webhook failed', err)
      return res.status(500).send(err)
    }

    res.send('OK')
  })

  return router
}
