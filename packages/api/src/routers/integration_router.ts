import cors from 'cors'
import express from 'express'
import { corsConfig } from '../utils/corsConfig'
import { env } from '../env'
import axios from 'axios'
import { buildLogger } from '../utils/logger'
import { getClaimsByToken } from '../utils/auth'

const logger = buildLogger('app.dispatch')

export function integrationRouter() {
  const router = express.Router()
  // request token from pocket
  router.post(
    '/pocket/request-token',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const token = (req.cookies.auth as string) || req.headers.authorization
      const claims = await getClaimsByToken(token)
      if (!claims) {
        return res.status(401).send('UNAUTHORIZED')
      }

      const consumerKey = env.pocket.consumerKey
      const redirectUri = `${env.client.url}/settings/integrations:pocketAuthorizationFinished`
      try {
        // make a POST request to Pocket to get a request token
        const response = await axios.post<{ code: string }>(
          'https://getpocket.com/v3/oauth/request',
          {
            consumer_key: consumerKey,
            redirect_uri: redirectUri,
          }
        )
        const { code } = response.data
        // store the request token in a cookie
        res.cookie('pocketRequestToken', code, {
          maxAge: 1000 * 60 * 60,
        })
        // redirect the user to Pocket to authorize the request token
        res.redirect(
          `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirectUri}`
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
