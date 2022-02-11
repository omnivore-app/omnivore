import type { NextApiRequest, NextApiResponse } from 'next'
import { withSentry } from '@sentry/nextjs'
import { serialize } from 'cookie'

const requestHandler = (req: NextApiRequest, res: NextApiResponse): void => {
  res.setHeader('Set-Cookie', serialize('auth', '', { maxAge: -1 }))
  res.send('logged out')
}

export default withSentry(requestHandler)
