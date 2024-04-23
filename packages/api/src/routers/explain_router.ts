/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { htmlToSpeechFile } from '@omnivore/text-to-speech-handler'
import cors from 'cors'
import express from 'express'
import { userRepository } from '../repository/user'
import { getClaimsByToken } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { getAISummary } from '../services/ai-summaries'
import { explainText } from '../services/explain'
import { FeatureName, findGrantedFeatureByName } from '../services/features'

export function explainRouter() {
  const router = express.Router()

  // Get an indexed summary for an individual library item
  router.post('/', cors<express.Request>(corsConfig), async (req, res) => {
    const token = req?.cookies?.auth || req?.headers?.authorization
    const claims = await getClaimsByToken(token)
    if (!claims) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const { uid } = claims
    const user = await userRepository.findById(uid)
    if (!user) {
      return res.status(400).send('Bad Request')
    }

    if (!(await findGrantedFeatureByName(FeatureName.AIExplain, user.id))) {
      return res.status(403).send('Not granted')
    }

    const libraryItemId = req.body.libraryItemId
    if (!libraryItemId) {
      return res.status(400).send('Bad request - no library item id provided')
    }

    const text = req.body.text
    if (!text) {
      return res.status(400).send('Bad request - no idx provided')
    }

    try {
      const result = await explainText(uid, text, libraryItemId)

      return res.send({
        text: result,
      })
    } catch (err) {
      console.log('Error: ', err)
    }

    return res.status(500).send('Error')
  })

  return router
}
