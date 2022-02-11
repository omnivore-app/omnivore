import { env, homePageURL } from '../env'
import * as jwt from 'jsonwebtoken'

export const createSsoToken = (
  authToken: string,
  redirectTo: string
): string => {
  const ssoToken = jwt.sign(
    { authToken, redirectTo },
    env.server.ssoJwtSecret,
    {
      expiresIn: '1d',
    }
  )
  return ssoToken
}

export const ssoRedirectURL = (ssoToken: string): string => {
  const u = new URL(homePageURL())
  u.pathname = 'api/client/auth'
  u.searchParams.append('tok', ssoToken)
  return u.toString()
}
