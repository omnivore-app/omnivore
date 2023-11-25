/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import {
  findOrCreateLabels,
  saveLabelsInLibraryItem,
} from '../../services/labels'
import { saveFeedItemInFollowing } from '../../services/library_item'
import { logger } from '../../utils/logger'

type SourceOfFollowing = 'feed' | 'newsletter' | 'user'

export interface SaveFollowingItemRequest {
  userIds: string[]
  title: string
  url: string
  itemId?: string
  addedToFollowingBy: string
  addedToFollowingFrom: SourceOfFollowing
  author?: string
  description?: string
  links?: any
  previewContent?: string
  previewContentType?: string
  publishedAt?: Date
  savedAt?: Date
  thumbnail?: string
}

function isSaveFollowingItemRequest(
  body: any
): body is SaveFollowingItemRequest {
  return (
    'userIds' in body &&
    'addedToFollowingBy' in body &&
    'addedToFollowingFrom' in body &&
    'url' in body &&
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

    if (
      req.body.addedToFollowingFrom === 'feed' &&
      req.body.userIds.length > 0
    ) {
      const userId = req.body.userIds[0]
      logger.info('saving feed item', userId)

      const result = await saveFeedItemInFollowing(req.body, userId)
      if (result.identifiers.length === 0) {
        logger.error('error saving feed item in following')
        return res.status(500).send('ERROR_SAVING_FEED_ITEM')
      }

      logger.info('feed item saved in following')

      // add RSS label to the item
      const labels = await findOrCreateLabels(
        [
          {
            name: 'RSS',
          },
        ],
        userId
      )
      await saveLabelsInLibraryItem(
        labels,
        result.identifiers[0].id,
        userId,
        undefined,
        true
      )

      logger.info('RSS label added to the item')

      return res.sendStatus(200)
    }

    res.sendStatus(200)
  })

  return router
}
