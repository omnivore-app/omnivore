/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import cors from 'cors'
import express from 'express'
import { LessThan } from 'typeorm'
import { StatusType } from '../../entity/user'
import { readPushSubscription } from '../../pubsub'
import { batchDelete } from '../../services/user'
import { corsConfig } from '../../utils/corsConfig'
import { logger } from '../../utils/logger'

type CleanupMessage = {
  subDays: number
}

const isCleanupMessage = (obj: any): obj is CleanupMessage =>
  'subDays' in obj && !isNaN(obj.subDays)

const getCleanupMessage = (msgStr: string): CleanupMessage => {
  try {
    const obj = JSON.parse(msgStr) as unknown
    if (isCleanupMessage(obj)) {
      return obj
    }
  } catch (err) {
    logger.error('error deserializing event: ', { msgStr, err })
  }

  return {
    subDays: 0, // default to 0
  }
}

export function userServiceRouter() {
  const router = express.Router()

  router.post('/prune', cors<express.Request>(corsConfig), async (req, res) => {
    logger.info('prune soft deleted users')

    const { message: msgStr, expired } = readPushSubscription(req)

    if (!msgStr) {
      return res.status(200).send('Bad Request')
    }

    if (expired) {
      logger.info('discarding expired message')
      return res.status(200).send('Expired')
    }

    const cleanupMessage = getCleanupMessage(msgStr)
    const subTime = cleanupMessage.subDays * 1000 * 60 * 60 * 24 // convert days to milliseconds

    try {
      const result = await batchDelete({
        status: StatusType.Deleted,
        updatedAt: LessThan(new Date(Date.now() - subTime)), // subDays ago
      })
      logger.info('prune result', result)

      return res.sendStatus(200)
    } catch (error) {
      logger.error('error prune users', error)

      return res.sendStatus(500)
    }
  })

  return router
}
