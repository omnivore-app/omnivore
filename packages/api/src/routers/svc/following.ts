/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { saveFeedItemInFollowing } from '../../services/library_item'
import { logger } from '../../utils/logger'

type SharedSource = 'feed' | 'newsletter' | 'user'

export interface SaveFollowingItemRequest {
  userIds: string[]
  title: string
  url: string
  itemId: string
  sharedAt: Date
  sharedBy: string
  sharedSource: SharedSource
  author?: string
  description?: string
  links?: any
  previewContent?: string
  publishedAt?: Date
  savedAt?: Date
}

function isSaveFollowingItemRequest(
  body: any
): body is SaveFollowingItemRequest {
  return (
    'userIds' in body &&
    'sharedAt' in body &&
    'sharedBy' in body &&
    'sharedSource' in body &&
    'url' in body &&
    'itemId' in body &&
    'title' in body
  )
}

export function followingServiceRouter() {
  const router = express.Router()

  router.post('/save', async (req, res) => {
    logger.info('save following item request', req.body)

    if (req.query.token !== process.env.PUBSUB_VERIFICATION_TOKEN) {
      console.log('query does not include valid token')
      return res.sendStatus(403)
    }

    if (!isSaveFollowingItemRequest(req.body)) {
      console.error('Invalid request body', req.body)
      return res.status(400).send('INVALID_REQUEST_BODY')
    }

    if (req.body.sharedSource === 'feed') {
      logger.info('saving feed item')

      const result = await saveFeedItemInFollowing(req.body)
      if (result.identifiers.length === 0) {
        logger.error('error saving feed item in following')
        return res.status(500).send('ERROR_SAVING_FEED_ITEM')
      }

      logger.info('feed item saved in following')
      return res.sendStatus(200)
    }

    res.sendStatus(200)
  })

  return router
}
