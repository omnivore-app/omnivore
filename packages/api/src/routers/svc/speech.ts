import express from 'express'
import cors from 'cors'
import { corsConfig } from '../../utils/corsConfig'
import { getRepository } from '../../entity/utils'
import { getPageById } from '../../elastic/pages'
import { synthesizeTextToSpeech } from '../../utils/textToSpeech'
import { Speech, SpeechState } from '../../entity/speech'
import { UserPersonalization } from '../../entity/user_personalization'
import { buildLogger } from '../../utils/logger'

const logger = buildLogger('app.dispatch')

export function speechServiceRouter() {
  const router = express.Router()

  router.options('/', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/', async (req, res) => {
    const { userId, pageId } = req.body as {
      userId: string
      pageId: string
    }

    if (!userId || !pageId) {
      return res.status(200).send('Invalid data')
    }

    const userPersonalization = await getRepository(
      UserPersonalization
    ).findOneBy({
      user: { id: userId },
    })
    if (!userPersonalization) {
      return res.status(200).send('User Personalization not found')
    }

    const page = await getPageById(pageId)
    if (!page) {
      return res.status(200).send('Page not found')
    }
    // const text = parseHTML(page.content).document.documentElement.innerText
    // if (!text) {
    //   return res.status(200).send('Page has no text')
    // }
    logger.info(`Create article speech`, {
      body: {
        userId,
        pageId,
      },
      labels: {
        source: 'CreateArticleSpeech',
      },
    })

    // initialize state
    const speech = await getRepository(Speech).save({
      user: { id: userId },
      elasticPageId: pageId,
      state: SpeechState.INITIALIZED,
      voice: userPersonalization.speechVoice,
    })

    try {
      const startTime = Date.now()
      const speechOutput = await synthesizeTextToSpeech({
        id: pageId,
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
        audioFileName: speechOutput.audioFileName,
        speechMarksFileName: speechOutput.speechMarksFileName,
        state: SpeechState.COMPLETED,
      })

      res.status(200).send('OK')
    } catch (error) {
      logger.error(`Error creating article speech`, { error })
      // update state
      await getRepository(Speech).update(speech.id, {
        state: SpeechState.FAILED,
      })
      res.status(500).send('Error creating article speech')
    }
  })

  return router
}
