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
import { Speech } from '../entity/speech'
import { getPageById } from '../elastic/pages'
import { parseHTML } from 'linkedom'
import { synthesizeTextToSpeech } from '../utils/textToSpeech'
import { UserPersonalization } from '../entity/user_personalization'

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
    '/:id/mp3',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      const id = req.params.id
      const token = req.cookies?.auth || req.headers?.authorization
      if (!token || !jwt.verify(token, env.server.jwtSecret)) {
        return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
      }
      const { uid } = jwt.decode(token) as Claims

      logger.info('Get article speech in mp3 format', {
        params: req.params,
        labels: {
          userId: uid,
          source: 'GetArticleSpeechMp3',
          articleId: id,
        },
      })

      logger.debug('Text to speech request', { articleId: id })
      const userPersonalization = await getRepository(
        UserPersonalization
      ).findOneBy({
        user: { id: uid },
      })
      if (!userPersonalization) {
        return res.status(200).send('userPersonalization not found')
      }

      const page = await getPageById(id)
      if (!page) {
        return res.status(200).send('Page not found')
      }

      const text = parseHTML(page.content).document.documentElement.textContent
      if (!text) {
        return res.status(200).send('Page has no text')
      }

      const speech = await synthesizeTextToSpeech({
        id,
        text,
        languageCode: page.language,
        voice: userPersonalization.speechVoice,
      })

      await getRepository(Speech).save({
        elasticPageId: id,
        audioUrl: speech.audioUrl,
        speechMarks: JSON.stringify(speech.speechMarks),
        user: { id: uid },
      })

      logger.info('Found speech mp3', { audioUrl: speech.audioUrl })
      res.redirect(speech.audioUrl)
    }
  )

  return router
}
