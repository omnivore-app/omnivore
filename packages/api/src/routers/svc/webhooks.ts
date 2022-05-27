/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import { getRepository } from '../../entity/utils'
import { Webhook } from '../../entity/webhook'
import axios, { Method } from 'axios'

export function webhooksServiceRouter() {
  const router = express.Router()

  router.post('/trigger/:action', async (req, res) => {
    console.log('trigger webhook of action', req.params.action)
    const { message: msgStr, expired } = readPushSubscription(req)

    if (!msgStr) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      console.log('discarding expired message')
      res.status(200).send('Expired')
      return
    }

    try {
      const data = JSON.parse(msgStr)
      const { userId, type } = data
      if (!userId || !type) {
        console.log('No userId or type found in message')
        res.status(400).send('Bad Request')
        return
      }

      // example: PAGE_CREATED
      const eventType = `${type as string}_${req.params.action}`.toUpperCase()
      const webhooks = await getRepository(Webhook)
        .createQueryBuilder()
        .where('user_id = :userId', { userId })
        .andWhere(':eventType = ANY(event_types)', { eventType })
        .andWhere('enabled = true')
        .getMany()

      if (webhooks.length <= 0) {
        console.log(
          'No active webhook found for user',
          userId,
          'and eventType',
          eventType
        )
        res.status(200).send('No webhook found')
        return
      }

      // trigger webhooks
      for (const webhook of webhooks) {
        const url = webhook.url
        const method = webhook.method as Method
        const body = JSON.stringify({
          action: req.params.action,
          userId,
          [type]: data,
        })

        console.log('triggering webhook', url, method, body)
        await axios.request({
          url,
          method,
          headers: {
            'Content-Type': webhook.contentType,
          },
          data: body,
        })
      }

      res.status(200).send('OK')
    } catch (err) {
      console.log('trigger webhook failed', err)
      res.status(500).send(err)
    }
  })

  return router
}
