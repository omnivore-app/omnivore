/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  router.post(
    '/',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const token = req?.cookies?.auth || req?.headers?.authorization
      const claims = await getClaimsByToken(token)
      if (!claims) {
        res.status(401).send('UNAUTHORIZED')
        return
      }

      const uid = claims?.uid
      if (!uid) {
        res.status(401).send('UNAUTHORIZED')
        return
      }
      const user = await userRepository.findById(uid)
      if (!user) {
        res.status(400).send('Bad Request')
        return
      }

      if (!(await findGrantedFeatureByName(FeatureName.AIExplain, user.id))) {
        res.status(403).send('Not granted')
        return
      }

      const libraryItemId = req.body.libraryItemId
      if (!libraryItemId) {
        res.status(400).send('Bad request - no library item id provided')
        return
      }

      const text = req.body.text
      if (!text) {
        res.status(400).send('Bad request - no idx provided')
        return
      }

      try {
        const result = await explainText(uid, text, libraryItemId)

        res.send({
          text: result,
        })
      } catch (err) {
        console.log('Error: ', err)
      }

      res.status(500).send('Error')
    }
  )

  return router
}
