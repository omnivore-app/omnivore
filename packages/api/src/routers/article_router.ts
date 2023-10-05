/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { htmlToSpeechFile } from '@omnivore/text-to-speech-handler'
import cors from 'cors'
import express from 'express'
import * as jwt from 'jsonwebtoken'
import { Speech } from '../entity/speech'
import { env } from '../env'
import { CreateArticleErrorCode } from '../generated/graphql'
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
  router.post('/save', cors<express.Request>(corsConfig), async (req, res) => {
    const { url } = req.body as {
      url?: string
    }

    const token = req?.cookies?.auth || req?.headers?.authorization
    const claims = await getClaimsByToken(token)
    if (!claims) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const { uid } = claims

    logger.info('Article saving request', {
      body: req.body,
      labels: {
        source: 'SaveEndpoint',
        userId: uid,
      },
    })

    if (!url) {
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    const result = await createPageSaveRequest({ userId: uid, url })

    if (isSiteBlockedForParse(url)) {
      return res
        .status(400)
        .send({ errorCode: CreateArticleErrorCode.NotAllowedToParse })
    }

    if (result.errorCode) {
      return res.status(400).send({ errorCode: result.errorCode })
    }

    return res.send({
      articleSavingRequestId: result.id,
      url: result.url,
    })
  })

  router.get(
    '/:id/:outputFormat',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      const articleId = req.params.id
      const outputFormat = req.params.outputFormat
      const { voice, secondaryVoice, language } = req.query as SpeechInput
      if (!articleId || outputFormats.indexOf(outputFormat) === -1) {
        return res.status(400).send('Invalid data')
      }
      const token = req.cookies?.auth || req.headers?.authorization
      if (!token || !jwt.verify(token, env.server.jwtSecret)) {
        return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
      }
      const { uid } = jwt.decode(token) as Claims
      if (!uid) {
        return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
      }
      logger.info(`Get article speech in ${outputFormat} format`, {
        params: req.params,
        labels: {
          userId: uid,
          source: `GetArticleSpeech-${outputFormat}`,
        },
      })

      try {
        const item = await findLibraryItemById(articleId, uid)
        if (!item) {
          return res.status(404).send('Page not found')
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
        return res.send({ ...speechFile, pageId: articleId })
      } catch (error) {
        logger.error('Error getting article speech:', error)
        res.status(500).send({ errorCode: 'INTERNAL_ERROR' })
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
