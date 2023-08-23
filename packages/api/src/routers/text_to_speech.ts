/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { htmlToSpeechFile } from '@omnivore/text-to-speech-handler'
import cors from 'cors'
import express from 'express'
import { AppDataSource } from '../data-source'
import { getPageById } from '../elastic/pages'
import { ArticleSavingRequestStatus } from '../elastic/types'
import { Speech, SpeechState } from '../entity/speech'
import { UserPersonalization } from '../entity/user_personalization'
import { readPushSubscription } from '../pubsub'
import { getRepository, setClaims } from '../repository'
import { FeatureName, getFeature } from '../services/features'
import { shouldSynthesize } from '../services/speech'
import { getClaimsByToken } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { enqueueTextToSpeech } from '../utils/createTask'
import { logger } from '../utils/logger'

const DEFAULT_VOICE = 'Larry'
const DEFAULT_COMPLIMENTARY_VOICE = 'Evelyn'

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
      const data: { userId: string; type: string; id: string } =
        JSON.parse(msgStr)
      const { userId, type, id } = data
      if (!userId || !type || !id) {
        logger.info('Invalid data')
        return res.status(400).send('Bad Request')
      }

      if (type.toUpperCase() !== 'PAGE') {
        logger.info('Not a page')
        return res.status(200).send('Not a page')
      }

      const page = await getPageById(id)
      if (!page) {
        logger.info('No page found', { id })
        return res.status(200).send('No page found')
      }
      if (page.userId !== userId) {
        logger.info('Page does not belong to user', { id, userId })
        return res.status(200).send('Page does not belong to user')
      }
      if (page.state === ArticleSavingRequestStatus.Processing) {
        logger.info('Page is still processing, try again later', { id })
        return res.status(400).send('Page is still processing')
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
            primaryVoice: userPersonalization?.speechVoice || DEFAULT_VOICE,
            secondaryVoice:
              userPersonalization?.speechSecondaryVoice ||
              DEFAULT_COMPLIMENTARY_VOICE,
            language: page.language,
          },
        })

        const feature = await getFeature(
          FeatureName.UltraRealisticVoice,
          userId
        )

        for (const utterance of speechFile.utterances) {
          // enqueue a task to convert text to speech
          const taskName = await enqueueTextToSpeech({
            userId,
            speechId: utterance.idx,
            text: utterance.text,
            voice: utterance.voice || DEFAULT_VOICE,
            priority: 'high',
            isUltraRealisticVoice: true,
            language: speechFile.language,
            rate: userPersonalization?.speechRate || '1.1',
            featureName: feature?.name,
            grantedAt: feature?.grantedAt,
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
