import axios from 'axios'
import cors from 'cors'
import express from 'express'
import { env } from '../env'
import { getClaimsByToken } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { buildLogger } from '../utils/logger'

const logger = buildLogger('app.dispatch')

export function integrationRouter() {
  const router = express.Router()
  // request token from pocket
  router.post(
    '/pocket/auth',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response) => {
      logger.info('pocket/request-token')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const token = (req.cookies.auth as string) || req.headers.authorization
      const claims = await getClaimsByToken(token)
      if (!claims) {
        return res.status(401).send('UNAUTHORIZED')
      }

      const consumerKey = env.pocket.consumerKey
      const redirectUri = `${env.client.url}/settings/integrations`
      try {
        // make a POST request to Pocket to get a request token
        const response = await axios.post<{ code: string }>(
          'https://getpocket.com/v3/oauth/request',
          {
            consumer_key: consumerKey,
            redirect_uri: redirectUri,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Accept': 'application/json',
            },
          }
        )
        const { code } = response.data
        // redirect the user to Pocket to authorize the request token
        res.redirect(
          `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirectUri}?pocketToken=${code}`
        )
      } catch (e) {
        logger.info('pocket/request-token exception:', e)
        res.redirect(
          `${env.client.url}/settings/integrations?errorCodes=UNKNOWN`
        )
      }
    }
  )
  return router
}
