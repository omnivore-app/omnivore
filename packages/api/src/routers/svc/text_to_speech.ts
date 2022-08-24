/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import cors from 'cors'
import { corsConfig } from '../../utils/corsConfig'
import { getRepository } from '../../entity/utils'
import { getPageById } from '../../elastic/pages'
import { Speech, SpeechState } from '../../entity/speech'
import { buildLogger } from '../../utils/logger'
import { getClaimsByToken } from '../../utils/auth'
import {
  setSpeechFailure,
  shouldSynthesize,
  synthesize,
} from '../../services/speech'
import { readPushSubscription } from '../../datalayer/pubsub'

const logger = buildLogger('app.dispatch')

export function speechServiceRouter() {
  const router = express.Router()

  router.options(
    '/auto-synthesis',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/auto-synthesize', async (req, res) => {
    logger.info('auto-synthesize')
    const { message: msgStr, expired } = readPushSubscription(req)

    if (!msgStr) {
      return res.status(400).send('Bad Request')
    }

    if (expired) {
      logger.info('discarding expired message')
      return res.status(200).send('Expired')
    }

    try {
      const data: { userId: string; type: string; id: string } =
        JSON.parse(msgStr)
      const { userId, type, id } = data
      if (!userId || !type) {
        logger.info('No userId or type found in message')
        return res.status(400).send('Bad Request')
      }

      if (type.toUpperCase() !== 'PAGE') {
        logger.info('Not a page')
        return res.status(200).send('Not a page')
      }

      // checks if this page needs to be synthesized automatically
      const page = await getPageById(id)
      if (!page) {
        logger.info('No page found', { id })
        return res.status(200).send('No page found')
      }

      if (await shouldSynthesize(userId, page)) {
        logger.info('page needs to be synthesized')
        // initialize state
        const speech = await getRepository(Speech).save({
          user: { id: userId },
          elasticPageId: id,
          state: SpeechState.INITIALIZED,
        })
        await synthesize(page, speech)
        logger.info('page synthesized')
      }

      res.status(200).send('Page should not synthesize')
    } catch (err) {
      logger.error('Auto synthesize failed', err)
      res.status(500).send(err)
    }
  })

  router.options('/', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/', async (req, res) => {
    logger.info('Synthesize svc request', {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body: req.body,
    })
    const token = req.query.token as string
    try {
      if (!(await getClaimsByToken(token))) {
        logger.info('Unauthorized request', { token })
        return res.status(200).send('UNAUTHORIZED')
      }
    } catch (error) {
      logger.error('Unauthorized request', { token, error })
      return res.status(200).send('UNAUTHORIZED')
    }

    const { userId, speechId } = req.body as {
      userId: string
      speechId: string
    }
    if (!userId || !speechId) {
      return res.status(200).send('Invalid data')
    }

    logger.info(`Create article speech`, {
      body: {
        userId,
        speechId,
      },
      labels: {
        source: 'CreateArticleSpeech',
      },
    })
    const speech = await getRepository(Speech).findOneBy({
      id: speechId,
      user: { id: userId },
    })
    if (!speech) {
      return res.status(200).send('Speech not found')
    }

    const page = await getPageById(speech.elasticPageId)
    if (!page) {
      await setSpeechFailure(speech.id)
      return res.status(200).send('Page not found')
    }

    try {
      await synthesize(page, speech)
    } catch (error) {
      logger.error(`Error synthesizing article`, { error })
      res.status(500).send('Error synthesizing article')
    }
  })

  return router
}
