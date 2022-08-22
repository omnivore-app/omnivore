import express from 'express'
import cors from 'cors'
import { corsConfig } from '../../utils/corsConfig'
import { getRepository } from '../../entity/utils'
import { getPageById } from '../../elastic/pages'
import { synthesizeTextToSpeech } from '../../utils/textToSpeech'
import { Speech, SpeechState } from '../../entity/speech'
import { buildLogger } from '../../utils/logger'
import { getClaimsByToken } from '../../utils/auth'
import { setSpeechFailure } from '../../services/speech'

const logger = buildLogger('app.dispatch')

export function speechServiceRouter() {
  const router = express.Router()

  router.options('/', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/', async (req, res) => {
    logger.info('Speech svc request', {
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
      const startTime = Date.now()
      const speechOutput = await synthesizeTextToSpeech({
        id: speech.id,
        text: page.content,
        languageCode: page.language,
        voice: speech.voice,
        textType: 'ssml',
      })
      logger.info('Created speech', {
        audioFileName: speechOutput.audioFileName,
        speechMarksFileName: speechOutput.speechMarksFileName,
        duration: Date.now() - startTime,
      })

      // set state to completed
      await getRepository(Speech).update(speech.id, {
        audioFileName: speechOutput.audioFileName,
        speechMarksFileName: speechOutput.speechMarksFileName,
        state: SpeechState.COMPLETED,
      })

      res.status(200).send('OK')
    } catch (error) {
      logger.error(`Error creating article speech`, { error })
      await setSpeechFailure(speech.id)
      res.status(500).send('Error creating article speech')
    }
  })

  return router
}
