import express from 'express'
import cors from 'cors'
import { corsConfig } from '../../utils/corsConfig'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { getPageById } from '../../elastic/pages'
import { htmlToSsml, synthesizeTextToSpeech } from '../../utils/textToSpeech'
import { Speech } from '../../entity/speech'

export function textToSpeechServiceRouter() {
  const router = express.Router()

  router.options('/', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  router.post('/', async (req, res) => {
    const { userId, pageId } = req.body as {
      userId: string
      pageId: string
    }

    if (!userId || !pageId) {
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    const user = await getRepository(User).findOne({
      where: { id: userId },
      relations: ['user_personalization'],
    })
    if (!user) {
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    const page = await getPageById(pageId)
    if (!page) {
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    const html = page.content
    const language = page.language
    const voice = user.userPersonalization.speechVoice || 'en-US_AllisonVoice'
    const rate = user.userPersonalization.speechRate || 100
    const volume = user.userPersonalization.speechVolume || 100
    const ssml = htmlToSsml(html, language, voice, rate, volume)

    const audioAndSpeechMarks = await synthesizeTextToSpeech({
      id: pageId,
      text: ssml,
    })

    await getRepository(Speech).save({
      elasticPageId: pageId,
      audioUrl: audioAndSpeechMarks.audioUrl,
      speechMarks: JSON.stringify(audioAndSpeechMarks.speechMarks),
      id: pageId,
      user,
    })
  })
}
