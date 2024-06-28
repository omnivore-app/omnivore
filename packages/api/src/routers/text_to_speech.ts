/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import cors from 'cors'
import express from 'express'
import { Speech, SpeechState } from '../entity/speech'
import { authTrx } from '../repository'
import { getClaimsByToken } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { logger } from '../utils/logger'

export function textToSpeechRouter() {
  const router = express.Router()

  router.options('/', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/', async (req, res) => {
    logger.info('Updating speech', {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body: req.body,
    })
    let userId: string
    const token = req.query.token as string
    try {
      const claims = await getClaimsByToken(token)
      if (!claims) {
        logger.info('Unauthorized request', { token })
        return res.status(401).send('UNAUTHORIZED')
      }
      userId = claims.uid
    } catch (error) {
      logger.error('Unauthorized request', { token, error })
      return res.status(401).send('UNAUTHORIZED')
    }

    const { speechId, audioFileName, speechMarksFileName, state } =
      req.body as {
        speechId: string
        audioFileName: string
        speechMarksFileName: string
        state: SpeechState
      }
    if (!speechId) {
      return res.status(400).send('Invalid data')
    }

    // set state to completed
    await authTrx(
      async (t) => {
        await t.getRepository(Speech).update(speechId, {
          audioFileName: audioFileName,
          speechMarksFileName: speechMarksFileName,
          state,
        })
      },
      {
        uid: userId,
      }
    )

    res.send('OK')
  })

  return router
}
