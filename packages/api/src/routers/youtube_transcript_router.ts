import cors from 'cors'
import express from 'express'
import { body, matchedData, validationResult } from 'express-validator'
import { userRepository } from '../repository/user'
import { findLibraryItemById } from '../services/library_item'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { enqueueProcessYouTubeVideo } from '../utils/createTask'
import { logger } from '../utils/logger'
import { isYouTubeVideoURL } from '../utils/youtube'

interface RequestData {
  libraryItemId: string
}

export function youtubeTranscriptRouter() {
  const router = express.Router()

  router.put(
    '/',
    cors<express.Request>(corsConfig),
    body('libraryItemId').isString().notEmpty(),
    async (req: express.Request, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ errorCodes: errors.array().map((e) => e.msg as string) })
      }

      const token = getTokenByRequest(req)

      let claims
      try {
        claims = await getClaimsByToken(token)
        if (!claims) {
          logger.info('failed to authorize')
          return res.sendStatus(401)
        }
      } catch (e) {
        logger.info('failed to authorize', e)
        return res.sendStatus(401)
      }

      const { uid } = claims
      const user = await userRepository.findById(uid)
      if (!user) {
        return res.status(404).send({ errorCodes: ['USER_NOT_FOUND'] })
      }

      const { libraryItemId } = matchedData<RequestData>(req)
      const libraryItem = await findLibraryItemById(libraryItemId, uid, {
        select: ['originalUrl'],
      })
      if (!libraryItem) {
        return res.status(404).send({ errorCodes: ['LIBRARY_ITEM_NOT_FOUND'] })
      }

      if (!isYouTubeVideoURL(libraryItem.originalUrl)) {
        return res.status(400).send({ errorCodes: ['NOT_YOUTUBE_VIDEO'] })
      }

      try {
        await enqueueProcessYouTubeVideo({ libraryItemId, userId: uid })
      } catch (error) {
        logger.error('Error processing youtube video:', error)
        return res.status(500).send({ errors: ['INTERNAL_SERVER_ERROR'] })
      }

      res.sendStatus(200)
    }
  )

  return router
}
