/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { htmlToSpeechFile } from '@omnivore/text-to-speech-handler'
import cors from 'cors'
import express from 'express'
import { userRepository } from '../repository/user'
import { getClaimsByToken } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { getAIResult } from '../services/ai-summaries'

export function aiRouter() {
  const router = express.Router()

  // Create an explain request, this will return an IDX to lookup the
  // result text
  router.post(
    '/explain/',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      // const token = req?.cookies?.auth || req?.headers?.authorization
      // const claims = await getClaimsByToken(token)
      // if (!claims) {
      //   return res.status(401).send('UNAUTHORIZED')
      // }
      // const { uid } = claims
      // const user = await userRepository.findById(uid)
      // if (!user) {
      //   return res.status(400).send('Bad Request')
      // }
      // const libraryItemId = req.params.libraryItemId
      // console.log('params: ', req.params)
      // if (!libraryItemId) {
      //   return res.status(400).send('Bad request - no library item id provided')
      // }
      // const idx = req.params.idx
      // if (!idx) {
      //   return res.status(400).send('Bad request - no idx provided')
      // }
      const uid = 'a3b98640-0f03-11eb-9237-0fda065354da'
      const libraryItemId = '6d028a14-ef5d-11ee-87f4-b365da03b5e1'

      const result = await getAIResult({
        userId: uid,
        idx: req.params.idx,
        libraryItemId: req.params.libraryItemId,
      })

      return res.send({
        summary: 'This is the explanation.',
      })
    }
  )

  return router
}
