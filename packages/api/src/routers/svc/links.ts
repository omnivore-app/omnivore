/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { readPushSubscription } from '../../pubsub'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { logger } from '../../utils/logger'

interface CreateLinkRequestMessage {
  url: string
  userId: string
}

export function linkServiceRouter() {
  const router = express.Router()

  router.post('/create', async (req, res) => {
    logger.info('create link req', req.query, req.body)
    const { message: msgStr, expired } = readPushSubscription(req)
    logger.info('read pubsub message', msgStr, 'has expired', expired)

    if (!msgStr) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      logger.info('discarding expired message')
      res.status(200).send('Expired')
      return
    }

    const data = JSON.parse(msgStr)
    if (!('url' in data) || !('userId' in data)) {
      logger.info('No file url or userId found in message')
      res.status(400).send('Bad Request')
      return
    }
    const msg = data as CreateLinkRequestMessage

    try {
      const request = await createPageSaveRequest({
        userId: msg.userId,
        url: msg.url,
      })
      logger.info('create link request', request)

      res.status(200).send(request)
    } catch (err) {
      logger.info('create link failed', err)
      res.status(500).send(err)
    }
  })

  return router
}
