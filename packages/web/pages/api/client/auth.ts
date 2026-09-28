import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import * as jwt from 'jsonwebtoken'
import { fetchEndpoint, ssoJwtSecret } from '../../../lib/appConfig'
import { DEFAULT_HOME_PATH } from '../../../lib/navigations'

type AuthPayload = {
  exchangeId: string
  redirectTo: string
}

const requestHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 365 * 24 * 60 * 60 * 1000,
    path: '/',
  }

  const tok = req.query.tok
  if (ssoJwtSecret && tok && !Array.isArray(tok)) {
    let payload: AuthPayload | undefined
    try {
      payload = jwt.verify(tok, ssoJwtSecret) as AuthPayload
    } catch {
      payload = undefined
    }

    if (payload?.exchangeId) {
      // The tok parameter carries only a one-time exchange id. The permanent
      // auth token is minted server-side by the API and never appears in the
      // URL, so a captured redirect (log, history, HAR) cannot be decoded
      // into a working credential.
      const exchangeUrl = new URL(`${fetchEndpoint}/auth/exchange`)
      try {
        const response = await fetch(exchangeUrl.toString(), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ssoToken: tok }),
        })
        const body = (await response.json()) as { authToken?: string }
        if (response.ok && body.authToken) {
          res.setHeader(
            'Set-Cookie',
            serialize('auth', body.authToken, cookieOptions)
          )
          res.writeHead(302, {
            Location: payload.redirectTo,
          })
          res.end()
          return
        }
      } catch {
        // fall through to the default redirect below
      }
    }
  }

  res.writeHead(302, {
    Location: DEFAULT_HOME_PATH,
  })
  res.end()
}

export default requestHandler