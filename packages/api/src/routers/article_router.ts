/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { CreateArticleErrorCode } from '../generated/graphql'
import { isSiteBlockedForParse } from '../utils/blocked'
import cors from 'cors'
import { buildLogger } from '../utils/logger'
import { corsConfig } from '../utils/corsConfig'
import { createPageSaveRequest } from '../services/create_page_save_request'
import { initModels } from '../server'
import { kx } from '../datalayer/knex_config'
import { getClaimsByToken } from '../utils/auth'
import * as jwt from 'jsonwebtoken'
import { env } from '../env'
import { Claims } from '../resolvers/types'
import { getRepository } from '../entity/utils'
import { Speech, SpeechState } from '../entity/speech'
import { getPageById } from '../elastic/pages'
import { synthesizeTextToSpeech } from '../utils/textToSpeech'
import { UserPersonalization } from '../entity/user_personalization'
import { generateDownloadSignedUrl } from '../utils/uploads'

const logger = buildLogger('app.dispatch')

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

    const models = initModels(kx, false)
    const result = await createPageSaveRequest(uid, url, models)

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
    })
  })

  router.get(
    '/:id/:outputFormat',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      const id = req.params.id
      const outputFormat = req.params.outputFormat
      if (!id || !['mp3', 'speech-marks'].includes(outputFormat)) {
        return res.status(400).send('Invalid data')
      }
      const token = req.cookies?.auth || req.headers?.authorization
      if (!token || !jwt.verify(token, env.server.jwtSecret)) {
        return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
      }
      const { uid } = jwt.decode(token) as Claims

      logger.info(`Get article speech in ${outputFormat} format`, {
        params: req.params,
        labels: {
          userId: uid,
          source: `GetArticleSpeech-${outputFormat}`,
        },
      })

      const existingSpeech = await getRepository(Speech).findOneBy({
        elasticPageId: id,
      })
      if (existingSpeech?.state === SpeechState.COMPLETED) {
        logger.info('Found existing completed speech', {
          audioUrl: existingSpeech.audioFileName,
          speechMarksUrl: existingSpeech.speechMarksFileName,
        })
        return res.redirect(await redirectUrl(existingSpeech, outputFormat))
      }
      if (existingSpeech?.state === SpeechState.INITIALIZED) {
        logger.info('Found existing in progress speech')
        // retry later
        return res.status(429).send('Speech is in progress')
      }

      logger.debug('Text to speech request', { articleId: id })
      const userPersonalization = await getRepository(
        UserPersonalization
      ).findOneBy({
        user: { id: uid },
      })
      if (!userPersonalization) {
        return res.status(404).send('User Personalization not found')
      }

      const page = await getPageById(id)
      if (!page) {
        return res.status(404).send('Page not found')
      }

      // const text = parseHTML(page.content).document.documentElement.innerText
      // if (!text) {
      //   return res.status(404).send('Page has no text')
      // }

      // initialize state
      const speech = await getRepository(Speech).save({
        user: { id: uid },
        elasticPageId: id,
        state: SpeechState.INITIALIZED,
        voice: userPersonalization.speechVoice,
      })
      try {
        const startTime = Date.now()
        const speechOutput = await synthesizeTextToSpeech({
          id,
          text: page.content,
          languageCode: page.language,
          voice: userPersonalization.speechVoice,
          textType: 'ssml',
        })
        logger.info('Created speech', {
          audioFileName: speechOutput.audioFileName,
          speechMarksFileName: speechOutput.speechMarksFileName,
          duration: Date.now() - startTime,
        })

        // update state
        await getRepository(Speech).update(speech.id, {
          state: SpeechState.COMPLETED,
          audioFileName: speech.audioFileName,
          speechMarksFileName: speech.speechMarksFileName,
        })
        speech.audioFileName = speechOutput.audioFileName
        speech.speechMarksFileName = speechOutput.speechMarksFileName

        res.redirect(await redirectUrl(speech, outputFormat))
      } catch (error) {
        logger.error('Text to speech error', { error })
        // update state
        await getRepository(Speech).update(speech.id, {
          state: SpeechState.FAILED,
        })
        res.status(500).send('Text to speech error')
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
