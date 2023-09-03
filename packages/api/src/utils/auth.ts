import * as bcrypt from 'bcryptjs'
import crypto from 'crypto'
import express from 'express'
import * as jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../env'
import { authTrx } from '../repository'
import { apiKeyRepository } from '../repository/api_key'
import { Claims, ClaimsToSet } from '../resolvers/types'
import { logger } from './logger'

export const OmnivoreAuthorizationHeader = 'Omnivore-Authorization'

const signToken = promisify(jwt.sign)

export const hashPassword = async (password: string, salt = 10) => {
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

export const generateApiKey = (): string => {
  // TODO: generate random string key
  return uuidv4()
}

export const hashApiKey = (apiKey: string) => {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

export const claimsFromApiKey = async (key: string): Promise<Claims> => {
  const hashedKey = hashApiKey(key)
  return authTrx(async (tx) => {
    const apiKeyRepo = tx.withRepository(apiKeyRepository)

    const apiKey = await apiKeyRepo.findOne({
      where: {
        key: hashedKey,
      },
      relations: ['user'],
    })
    if (!apiKey) {
      throw new Error('api key not found')
    }

    const iat = Math.floor(Date.now() / 1000)
    const exp = Math.floor(new Date(apiKey.expiresAt).getTime() / 1000)
    if (exp < iat) {
      throw new Error('api key expired')
    }

    // update last used
    await apiKeyRepo.update(apiKey.id, { usedAt: new Date() })

    return {
      uid: apiKey.user.id,
      iat,
      exp,
    }
  })
}

// verify jwt token first
// if valid then decode and return claims
// if expired then throw error
// if not valid then verify api key
export const getClaimsByToken = async (
  token: string | undefined
): Promise<Claims | undefined> => {
  let claims: Claims | undefined

  if (!token) {
    return undefined
  }

  try {
    jwt.verify(token, env.server.jwtSecret) &&
      (claims = jwt.decode(token) as Claims)

    return claims
  } catch (e) {
    if (
      e instanceof jwt.JsonWebTokenError &&
      !(e instanceof jwt.TokenExpiredError)
    ) {
      logger.info(`not a jwt token, checking api key`, { token })
      return claimsFromApiKey(token)
    }

    throw e
  }
}

export const generateVerificationToken = (
  user: {
    id: string
    email?: string
  },
  expireInSeconds = 60 * 60 * 24 // 1 day
): string => {
  const iat = Math.floor(Date.now() / 1000)
  const exp = Math.floor(
    new Date(Date.now() + expireInSeconds * 1000).getTime() / 1000
  )

  return jwt.sign(
    { uid: user.id, iat, exp, email: user.email },
    env.server.jwtSecret
  )
}

export const setAuthInCookie = async (
  claims: ClaimsToSet,
  res: express.Response,
  secret: string = env.server.jwtSecret
) => {
  // set auth cookie in response header
  const token = await signToken(claims, secret)

  res.cookie('auth', token, {
    httpOnly: true,
    expires: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
  })
}

export const getTokenByRequest = (req: express.Request): string | undefined => {
  return (
    req.header(OmnivoreAuthorizationHeader) ||
    req.headers.authorization ||
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (req.cookies?.auth as string)
  )
}
