/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { htmlToSpeechFile } from '@omnivore/text-to-speech-handler/build/src/htmlToSsml'
import cors from 'cors'
import express from 'express'
import * as jwt from 'jsonwebtoken'
import { Speech } from '../entity/speech'
import { env } from '../env'
import { CreateArticleErrorCode } from '../generated/graphql'
import { userRepository } from '../repository/user'
import { Claims } from '../resolvers/types'
import { createPageSaveRequest } from '../services/create_page_save_request'
import { findLibraryItemById } from '../services/library_item'
import { getClaimsByToken } from '../utils/auth'
import { isSiteBlockedForParse } from '../utils/blocked'
import { corsConfig } from '../utils/corsConfig'
import { logger } from '../utils/logger'
import { generateDownloadSignedUrl } from '../utils/uploads'

interface SpeechInput {
  voice?: string
  secondaryVoice?: string
  priority?: 'low' | 'high'
  language?: string
}
const outputFormats = ['mp3', 'speech-marks', 'speech']

export function articleRouter() {
  const router = express.Router()

  router.options('/save', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  router.post(
    '/save',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const { url } = req.body as {
        url?: string
      }
      if (!url) {
        res.status(400).send({ errorCode: 'BAD_DATA' })
        return
      }

      const token = req?.cookies?.auth || req?.headers?.authorization
      const claims = await getClaimsByToken(token)
      if (!claims) {
        res.status(401).send('UNAUTHORIZED')
        return
      }

      const { uid } = claims
      const user = await userRepository.findById(uid)
      if (!user) {
        res.status(400).send('Bad Request')
        return
      }

      if (!url) {
        res.status(400).send({ errorCode: 'BAD_DATA' })
        return
      }

      if (isSiteBlockedForParse(url)) {
        res
          .status(400)
          .send({ errorCode: CreateArticleErrorCode.NotAllowedToParse })
        return
      }

      try {
        const result = await createPageSaveRequest({ user, url })

        res.send({
          articleSavingRequestId: result.id,
          url: result.originalUrl,
        })
        return
      } catch (error) {
        logger.error('Error saving article:', error)
        res.status(500).send({ errorCode: 'INTERNAL_ERROR' })
        return
      }
    }
  )

  router.get(
    '/:id/:outputFormat',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const articleId = req.params.id
      const outputFormat = req.params.outputFormat
      const { voice, secondaryVoice, language } = req.query as SpeechInput
      if (!articleId || outputFormats.indexOf(outputFormat) === -1) {
        res.status(400).send('Invalid data')
        return
      }
      const token = req.cookies?.auth || req.headers?.authorization
      if (!token || !jwt.verify(token, env.server.jwtSecret)) {
        res.status(401).send({ errorCode: 'UNAUTHORIZED' })
        return
      }
      const { uid } = jwt.decode(token) as Claims
      if (!uid) {
        res.status(401).send({ errorCode: 'UNAUTHORIZED' })
        return
      }
      logger.info(`Get article speech in ${outputFormat} format`, {
        params: req.params,
        labels: {
          userId: uid,
          source: `GetArticleSpeech-${outputFormat}`,
        },
      })

      try {
        const item = await findLibraryItemById(articleId, uid, {
          select: ['title', 'readableContent', 'itemLanguage'],
        })
        if (!item) {
          res.status(404).send('Page not found')
          return
        }

        const speechFile = htmlToSpeechFile({
          title: item.title,
          content: item.readableContent,
          options: {
            primaryVoice: voice,
            secondaryVoice: secondaryVoice,
            language: language || item.itemLanguage || undefined,
          },
        })
        res.send({ ...speechFile, pageId: articleId })
        return
      } catch (error) {
        logger.error('Error getting article speech:', error)
        res.status(500).send({ errorCode: 'INTERNAL_ERROR' })
        return
      }
    }
  )

  return router
}

const redirectUrl = async (speech: Speech, outputFormat: string) => {
  switch (outputFormat) {
    case 'mp3':
      return generateDownloadSignedUrl(speech.audioFileName)
    case 'speech-marks':
      return generateDownloadSignedUrl(speech.speechMarksFileName)
    default:
      return generateDownloadSignedUrl(speech.audioFileName)
  }
}
