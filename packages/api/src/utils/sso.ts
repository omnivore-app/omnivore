import { env, homePageURL } from '../env'
import { redisDataSource } from '../redis_data_source'
import * as jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const SSO_EXPIRY_SECONDS = 300
const SSO_EXCHANGE_KEY_PREFIX = 'sso:exchange:'

export const createSsoToken = (
  authToken: string,
  redirectTo: string
): string => {
  const exchangeId = uuidv4()
  // The permanent auth token never leaves the server: it is stored under a
  // random one-time exchange id instead of being embedded in the redirect
  // URL. JWT payloads are signed, not encrypted, so any credential carried in
  // the tok parameter is recoverable by anyone who observes the URL (access
  // logs, browser history, HAR exports). The URL now carries only an
  // exchange id that is single-use and short-lived.
  void redisDataSource.redisClient?.setex(
    `${SSO_EXCHANGE_KEY_PREFIX}${exchangeId}`,
    SSO_EXPIRY_SECONDS,
    authToken
  )

  const ssoToken = jwt.sign(
    { exchangeId, redirectTo },
    env.server.ssoJwtSecret,
    {
      expiresIn: `${SSO_EXPIRY_SECONDS}s`,
    }
  )
  return ssoToken
}

export const exchangeSsoToken = async (
  ssoToken: string
): Promise<string | undefined> => {
  let payload: { exchangeId: string; redirectTo: string } | undefined
  try {
    payload = jwt.verify(ssoToken, env.server.ssoJwtSecret) as typeof payload
  } catch {
    return undefined
  }
  if (!payload?.exchangeId) return undefined

  // getdel gives single-use semantics: replaying the same tok from a log or
  // shared link fails on the second attempt even inside the 5 minute window.
  const client = redisDataSource.redisClient
  if (!client) return undefined
  const authToken = await client.getdel(
    `${SSO_EXCHANGE_KEY_PREFIX}${payload.exchangeId}`
  )
  return authToken === null ? undefined : authToken
}

export const ssoRedirectURL = (ssoToken: string): string => {
  const u = new URL(homePageURL())
  u.pathname = 'api/client/auth'
  u.searchParams.append('tok', ssoToken)
  return u.toString()
}