import * as cookie from 'cookie'
import * as jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { env } from '../../env'
import { logger } from '../../utils/logger'
import {
  IntegrationTokenPayload,
  isPendingUserTokenPayload,
  PendingUserTokenPayload,
} from './auth_types'

const signToken = promisify(jwt.sign)

type MobileAuthPayload = {
  authToken: string
  authCookieString: string
}

export async function createWebAuthToken(
  userId: string
): Promise<string | undefined> {
  try {
    const authToken = await signToken({ uid: userId }, env.server.jwtSecret)
    return authToken as string
  } catch {
    return undefined
  }
}

export async function createMobileAuthPayload(
  userId: string
): Promise<MobileAuthPayload> {
  const authToken = await signToken({ uid: userId }, env.server.jwtSecret)
  const authCookieString = cookie.serialize('auth', authToken as string, {
    httpOnly: true,
    expires: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
  })

  return {
    authToken: authToken as string,
    authCookieString,
  }
}

export async function createPendingUserToken(
  payload: PendingUserTokenPayload
): Promise<string | undefined> {
  try {
    const authToken = await signToken(payload, env.server.jwtSecret)
    logger.info('creating pending user auth token', payload)
    if (typeof authToken === 'string') {
      return authToken
    } else {
      return undefined
    }
  } catch {
    return undefined
  }
}

export function decodePendingUserToken(
  token: string
): PendingUserTokenPayload | undefined {
  try {
    const decoded = jwt.verify(token, env.server.jwtSecret) as unknown

    if (isPendingUserTokenPayload(decoded)) {
      return decoded
    } else {
      return undefined
    }
  } catch {
    return undefined
  }
}

// Generates a username by a prefix generated from the user's name
// plus a random number between 0 and 1000
export function suggestedUsername(name: string): string {
  if (name.length === 0) {
    return ''
  }
  const username = name.toLowerCase().replace(/\s/g, '')
  const maxLength = Math.floor(Math.random() * 6) + 6 // range: 6 - 11
  const prefix = username.substring(0, Math.min(maxLength, username.length))
  const suffix = Math.floor(Math.random() * 10000)
  return `${prefix}${suffix}`
}

export async function createIntegrationToken(
  payload: IntegrationTokenPayload
): Promise<string | undefined> {
  try {
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
    const authToken = await signToken(
      {
        ...payload,
        exp,
      },
      env.server.jwtSecret
    )
    logger.info('createIntegrationToken', payload)
    return authToken as string
  } catch {
    return undefined
  }
}
