import express from 'express'
import cors from 'cors'
import { corsConfig } from '../../utils/corsConfig'
import { getRepository } from '../../entity/utils'
import { getPageById } from '../../elastic/pages'
import { synthesizeTextToSpeech } from '../../utils/textToSpeech'
import { Speech } from '../../entity/speech'
import { parseHTML } from 'linkedom'
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

    const text = parseHTML(page.content).document.documentElement.innerText
    if (!text) {
      return res.status(200).send('Page has no text')
    }

    logger.info(`Create article speech`, {
      body: {
        userId,
        pageId,
      },
      labels: {
        source: 'CreateArticleSpeech',
      },
    })

    try {
      const startTime = Date.now()
      const speechOutput = await synthesizeTextToSpeech({
        id: pageId,
        text,
        languageCode: page.language,
        voice: userPersonalization.speechVoice,
      })
      logger.info('Created speech', {
        audioUrl: speechOutput.audioUrl,
        speechMarksUrl: speechOutput.speechMarksUrl,
        duration: Date.now() - startTime,
      })

      await getRepository(Speech).save({
        elasticPageId: pageId,
        audioUrl: speechOutput.audioUrl,
        speechMarksUrl: speechOutput.speechMarksUrl,
        user: { id: userId },
      })

      res.status(200).send('OK')
    } catch (error) {
      logger.error(`Error creating article speech`, { error })
      res.status(500).send('Error creating article speech')
    }
  })

  return router
}
