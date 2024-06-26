import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import * as jwt from 'jsonwebtoken'
import { withSentry } from '@sentry/nextjs'
import { ssoJwtSecret } from '../../../lib/appConfig'

type AuthPayload = {
  authToken: string
  redirectTo: string
}

const requestHandler = (req: NextApiRequest, res: NextApiResponse): void => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 365 * 24 * 60 * 60 * 1000,
    path: '/',
  }

  const tok = req.query.tok
  if (ssoJwtSecret && tok && !Array.isArray(tok)) {
    const payload = jwt.verify(tok, ssoJwtSecret) as AuthPayload
    res.setHeader(
      'Set-Cookie',
      serialize('auth', payload.authToken, cookieOptions)
    )
    res.writeHead(302, {
      Location: payload.redirectTo,
    })
  } else {
    res.writeHead(302, {
      Location: '/l/home',
    })
  }

  res.end()
}

export default withSentry(requestHandler)
