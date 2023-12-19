/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { LessThan } from 'typeorm'
import { LibraryItemState } from '../../entity/library_item'
import { readPushSubscription } from '../../pubsub'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { deleteLibraryItemsByAdmin } from '../../services/library_item'
import { logger } from '../../utils/logger'

interface CreateLinkRequestMessage {
  url: string
  userId: string
}

type PruneMessage = {
  expireInDays: number
  folder?: string
  state?: LibraryItemState
}

const isPruneMessage = (obj: any): obj is PruneMessage => 'expireInDays' in obj

const getPruneMessage = (msgStr: string): PruneMessage => {
  try {
    const obj = JSON.parse(msgStr) as unknown
    if (isPruneMessage(obj)) {
      return obj
    }
  } catch (err) {
    console.log('error deserializing event: ', { msgStr, err })
  }

  // default to prune following folder items older than 30 days
  return {
    folder: 'following',
    expireInDays: 30,
  }
}

export function linkServiceRouter() {
  const router = express.Router()

  router.post('/create', async (req, res) => {
    logger.info('create link req', req)
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

  router.post('/prune', async (req, res) => {
    logger.info('prune expired items in folder')

    const { message: msgStr, expired } = readPushSubscription(req)

    if (!msgStr) {
      return res.status(200).send('Bad Request')
    }

    if (expired) {
      logger.info('discarding expired message')
      return res.status(200).send('Expired')
    }

    const pruneMessage = getPruneMessage(msgStr)
    const expireTime = pruneMessage.expireInDays * 1000 * 60 * 60 * 24 // convert days to milliseconds

    try {
      const result = await deleteLibraryItemsByAdmin({
        folder: pruneMessage.folder,
        state: pruneMessage.state,
        updatedAt: LessThan(new Date(Date.now() - expireTime)),
      })
      logger.info('prune result', result)

      return res.sendStatus(200)
    } catch (error) {
      logger.error('error prune items', error)

      return res.sendStatus(500)
    }
  })

  return router
}
