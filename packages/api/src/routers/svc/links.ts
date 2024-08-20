/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { readPushSubscription } from '../../pubsub'
import { userRepository } from '../../repository/user'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { enqueuePruneTrashJob } from '../../utils/createTask'
import { enqueueExpireFoldersJob } from '../../utils/createTask'
import { logger } from '../../utils/logger'

interface CreateLinkRequestMessage {
  url: string
  userId: string
}

type PruneMessage = {
  ttlInDays?: number
}

export function linkServiceRouter() {
  const router = express.Router()

  router.post('/create', async (req, res) => {
    const { message: msgStr, expired } = readPushSubscription(req)
    logger.info('read pubsub message', { msgStr, expired })

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

    const user = await userRepository.findById(msg.userId)
    if (!user) {
      return res.status(400).send('Bad Request')
    }

    try {
      const request = await createPageSaveRequest({
        user,
        url: msg.url,
      })

      res.status(200).send(request)
    } catch (err) {
      logger.info('create link failed', err)
      res.status(500).send(err)
    }
  })

  router.post('/pruneTrash', async (req, res) => {
    const { message: msgStr, expired } = readPushSubscription(req)

    if (expired) {
      logger.info('discarding expired message')
      return res.status(200).send('Expired')
    }

    // default to prune trash items older than 14 days
    let ttlInDays = 14

    if (msgStr) {
      const pruneMessage = JSON.parse(msgStr) as PruneMessage

      if (pruneMessage.ttlInDays) {
        ttlInDays = pruneMessage.ttlInDays
      }
    }

    try {
      const job = await enqueuePruneTrashJob(ttlInDays)
      logger.info('enqueue prune trash job', { id: job?.id })

      return res.sendStatus(200)
    } catch (error) {
      logger.error('error prune items', error)

      return res.sendStatus(500)
    }
  })

  router.post('/expireFolders', async (req, res) => {
    const { expired } = readPushSubscription(req)

    if (expired) {
      logger.info('discarding expired message')
      return res.status(200).send('Expired')
    }

    try {
      const job = await enqueueExpireFoldersJob()
      logger.info('enqueue job', { id: job?.id })

      return res.sendStatus(200)
    } catch (error) {
      logger.error('error expire folders', error)

      return res.sendStatus(500)
    }
  })

  return router
}
