import express from 'express'
import cors from 'cors'
import { corsConfig } from '../../utils/corsConfig'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { getPageById } from '../../elastic/pages'
import { synthesizeTextToSpeech } from '../../utils/textToSpeech'
import { Speech } from '../../entity/speech'
import { parseHTML } from 'linkedom'

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

    const user = await getRepository(User).findOne({
      where: { id: userId },
      relations: ['user_personalization'],
    })
    if (!user) {
      return res.status(200).send('User not found')
    }

    const page = await getPageById(pageId)
    if (!page) {
      return res.status(200).send('Page not found')
    }

    const text = parseHTML(page.content).document.documentElement.textContent
    if (!text) {
      return res.status(200).send('Page has no text')
    }

    const speech = await synthesizeTextToSpeech({
      id: pageId,
      text,
      languageCode: page.language,
      voice: user.userPersonalization.speechVoice,
    })

    await getRepository(Speech).save({
      elasticPageId: pageId,
      audioUrl: speech.audioUrl,
      speechMarks: speech.speechMarksUrl,
      user,
    })

    res.status(200).send('OK')
  })

  return router
}
