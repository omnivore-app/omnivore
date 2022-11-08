/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import cors from 'cors'
import { corsConfig } from '../utils/corsConfig'
import { getRepository, setClaims } from '../entity/utils'
import { getPageById } from '../elastic/pages'
import { Speech, SpeechState } from '../entity/speech'
import { buildLogger } from '../utils/logger'
import { getClaimsByToken } from '../utils/auth'
import { shouldSynthesize } from '../services/speech'
import { readPushSubscription } from '../datalayer/pubsub'
import { AppDataSource } from '../server'
import { enqueueTextToSpeech } from '../utils/createTask'
import { htmlToSpeechFile } from '@omnivore/text-to-speech-handler'
import { UserPersonalization } from '../entity/user_personalization'

const logger = buildLogger('app.dispatch')

export function textToSpeechRouter() {
  const router = express.Router()

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
      const data: { userId: string; type: string; id: string; state: string } =
        JSON.parse(msgStr)
      const { userId, type, id, state } = data
      if (!userId || !type || !id) {
        logger.info('Invalid data')
        return res.status(400).send('Bad Request')
      }

      if (type.toUpperCase() !== 'PAGE' || state !== 'SUCCEEDED') {
        logger.info('Not a page or not succeeded')
        return res.status(200).send('Not a page or not succeeded')
      }

      const page = await getPageById(id)
      if (!page) {
        logger.info('No page found', { id })
        return res.status(200).send('No page found')
      }

      // checks if this page needs to be synthesized automatically
      if (await shouldSynthesize(userId, page)) {
        logger.info('page needs to be synthesized')

        const userPersonalization = await getRepository(
          UserPersonalization
        ).findOneBy({ user: { id: userId } })

        const speechFile = htmlToSpeechFile({
          title: page.title,
          content: page.content,
          options: {
            primaryVoice: userPersonalization?.speechVoice || 'Axel',
            secondaryVoice: userPersonalization?.speechVoice || 'Evelyn',
            language: page.language || 'English',
            rate: '1.1',
          },
        })

        for (const utterance of speechFile.utterances) {
          // enqueue a task to convert text to speech
          const taskName = await enqueueTextToSpeech({
            userId,
            speechId: utterance.idx,
            text: utterance.text,
            voice: utterance.voice || 'Axel',
            priority: 'high',
            isUltraRealisticVoice: true,
          })
          logger.info('Start Text to speech task', { taskName })
        }

        return res.status(202).send('Text to speech task started')
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
    logger.info('Updating speech', {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body: req.body,
    })
    let userId: string
    const token = req.query.token as string
    try {
      const claims = await getClaimsByToken(token)
      if (!claims) {
        logger.info('Unauthorized request', { token })
        return res.status(401).send('UNAUTHORIZED')
      }
      userId = claims.uid
    } catch (error) {
      logger.error('Unauthorized request', { token, error })
      return res.status(401).send('UNAUTHORIZED')
    }

    const { speechId, audioFileName, speechMarksFileName, state } =
      req.body as {
        speechId: string
        audioFileName: string
        speechMarksFileName: string
        state: SpeechState
      }
    if (!speechId) {
      return res.status(400).send('Invalid data')
    }

    // set state to completed
    await AppDataSource.transaction(async (t) => {
      await setClaims(t, userId)
      await t.getRepository(Speech).update(speechId, {
        audioFileName: audioFileName,
        speechMarksFileName: speechMarksFileName,
        state,
      })
    })

    res.send('OK')
  })

  return router
}
