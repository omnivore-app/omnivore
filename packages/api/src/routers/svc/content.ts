/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { readPushSubscription } from '../../pubsub'
import { logger } from '../../utils/logger'
import {
  UpdateContentMessage,
  updateContentForFileItem,
} from '../../services/update_pdf_content'

export function contentServiceRouter() {
  const router = express.Router()

  router.post('/search', async (req, res) => {
    const { message: msgStr, expired } = readPushSubscription(req)
    logger.info('read pubsub message', { msgStr, expired })

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
    if (!('fileId' in data) || !('content' in data)) {
      logger.info('No file id or content found in message')
      res.status(200).send('Bad Request')
      return
    }
    const msg = data as UpdateContentMessage
    if (!(await updateContentForFileItem(msg))) {
      res.status(404).send('Bad Request')
      return
    }
    res.sendStatus(200)
    return
  })

  return router
}
