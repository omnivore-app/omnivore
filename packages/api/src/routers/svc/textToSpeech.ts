import express from 'express'
import cors from 'cors'
import { corsConfig } from '../../utils/corsConfig'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { getPageById } from '../../elastic/pages'
import { synthesizeTextToSpeech } from '../../utils/textToSpeech'
import { Speech } from '../../entity/speech'

export function textToSpeechServiceRouter() {
  const router = express.Router()

  router.options('/', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  router.post('/', async (req, res) => {
    const { userId, pageId, text } = req.body as {
      userId: string
      pageId: string
      text: string
    }

    if (!userId || !pageId || !text) {
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

    const audioAndSpeechMarks = await synthesizeTextToSpeech({
      id: pageId,
      text,
      languageCode: page.language,
      voice: user.userPersonalization.speechVoice,
    })

    await getRepository(Speech).save({
      elasticPageId: pageId,
      audioUrl: audioAndSpeechMarks.audioUrl,
      speechMarks: JSON.stringify(audioAndSpeechMarks.speechMarks),
      user,
    })

    res.status(200).send('OK')
  })
}
