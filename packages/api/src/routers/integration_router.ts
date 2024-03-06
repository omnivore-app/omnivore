import axios from 'axios'
import cors from 'cors'
import express from 'express'
import { env } from '../env'
import { getIntegrationClient } from '../services/integrations'
import { getClaimsByToken } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { logger } from '../utils/logger'

export function integrationRouter() {
  const router = express.Router()
  // request token from pocket
  router.post(
    '/:name/auth',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const token = (req.cookies.auth as string) || req.headers.authorization
      const claims = await getClaimsByToken(token)
      if (!claims) {
        return res.status(401).send('UNAUTHORIZED')
      }

      const integrationClient = getIntegrationClient(req.params.name, '')

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const state = req.body.state as string
      try {
        const redirectUri = await integrationClient.auth(state)
        // redirect the user to Pocket to authorize the request token
        res.redirect(redirectUri)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          logger.error(error.response)
        } else {
          logger.error(error)
        }

        res.redirect(
          `${env.client.url}/settings/integrations?errorCodes=UNKNOWN`
        )
      }
    }
  )
  return router
}
