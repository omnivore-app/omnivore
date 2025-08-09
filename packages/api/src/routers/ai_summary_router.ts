/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { htmlToSpeechFile } from '@omnivore/text-to-speech-handler/build/src/htmlToSsml'
import cors from 'cors'
import express from 'express'
import { userRepository } from '../repository/user'
import { getClaimsByToken } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { getAISummary } from '../services/ai-summaries'

export function aiSummariesRouter(): express.Router {
  const router = express.Router()

  // Get an indexed summary for an individual library item
  router.get(
    '/library-item/:libraryItemId/:idx',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const token = req?.cookies?.auth || req?.headers?.authorization
      const claims = await getClaimsByToken(token)
      if (!claims) {
        res.status(401).send('UNAUTHORIZED')
        return
      }

      const { uid } = claims
      const user = await userRepository.findById(uid)
      if (!user) {
        res.status(400).send('Bad Request')
        return
      }

      const libraryItemId = req.params.libraryItemId
      console.log('params: ', req.params)
      if (!libraryItemId) {
        res.status(400).send('Bad request - no library item id provided')
        return
      }

      const idx = req.params.idx
      if (!idx) {
        res.status(400).send('Bad request - no idx provided')
        return
      }

      const result = await getAISummary({
        userId: user.id,
        idx: req.params.idx,
        libraryItemId: req.params.libraryItemId,
      })

      res.send({
        summary: result?.summary,
      })
    }
  )

  return router
}
