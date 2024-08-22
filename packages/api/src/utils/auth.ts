import * as bcrypt from 'bcryptjs'
import crypto from 'crypto'
import express from 'express'
import * as jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { v4 as uuidv4, validate } from 'uuid'
import { ApiKey } from '../entity/api_key'
import { env } from '../env'
import { redisDataSource } from '../redis_data_source'
import { getRepository } from '../repository'
import { Claims, ClaimsToSet } from '../resolvers/types'

export const OmnivoreAuthorizationHeader = 'Omnivore-Authorization'

const signToken = promisify(jwt.sign)

export const hashPassword = async (password: string, salt = 10) => {
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

export const generateApiKey = (): string => {
  // generate random string key
  return uuidv4()
}

export const isApiKey = (key: string): boolean => {
  // check if key in is uuid v4 format
  return validate(key)
}

export const hashApiKey = (apiKey: string) => {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

export const claimsFromApiKey = async (hashedKey: string): Promise<Claims> => {
  const apiKeyRepo = getRepository(ApiKey)

  const apiKey = await apiKeyRepo
    .createQueryBuilder('apiKey')
    .innerJoinAndSelect('apiKey.user', 'user')
    .where({
      key: hashedKey,
    })
    .getOne()
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
}

const claimsCacheKey = (hashedKey: string) => `api-key-hash:${hashedKey}`

const getCachedClaims = async (
  hashedKey: string
): Promise<Claims | undefined> => {
  const cache = await redisDataSource.redisClient?.get(
    claimsCacheKey(hashedKey)
  )
  if (!cache) {
    return undefined
  }

  return JSON.parse(cache) as Claims
}

const cacheClaims = async (hashedKey: string, claims: Claims) => {
  await redisDataSource.redisClient?.set(
    claimsCacheKey(hashedKey),
    JSON.stringify(claims),
    'EX',
    claims.exp ? claims.exp - claims.iat : 3600 * 24 * 365 // default 1 year
  )
}

export const deleteCachedClaims = async (key: string) => {
  await redisDataSource.redisClient?.del(claimsCacheKey(key))
}

// verify jwt token first
// if valid then decode and return claims
// if expired then throw error
// if not valid then verify api key
export const getClaimsByToken = async (
  token: string | undefined
): Promise<Claims | undefined> => {
  if (!token) {
    return undefined
  }

  if (isApiKey(token)) {
    const hashedKey = hashApiKey(token)
    const cachedClaims = await getCachedClaims(hashedKey)
    if (cachedClaims) {
      return cachedClaims
    }

    const claims = await claimsFromApiKey(hashedKey)
    await cacheClaims(hashedKey, claims)

    return claims
  }

  return jwt.verify(token, env.server.jwtSecret) as Claims
}

const verificationTokenKey = (token: string) => `verification:${token}`

export const verifyToken = async (token: string): Promise<Claims> => {
  const redisClient = redisDataSource.redisClient
  const key = verificationTokenKey(token)
  if (redisClient) {
    const cachedToken = await redisClient.get(key)
    if (!cachedToken) {
      throw new Error('Token not found')
    }
  }

  const claims = jwt.verify(token, env.server.jwtSecret) as Claims
  if (claims.destroyAfterUse) {
    await redisClient?.del(key)
  }

  return claims
}

export const generateVerificationToken = async (
  user: {
    id: string
    email?: string
  },
  expireInSeconds = 60, // 1 minute
  destroyAfterUse = true
): Promise<string> => {
  const iat = Math.floor(Date.now() / 1000)
  const exp = Math.floor(
    new Date(Date.now() + expireInSeconds * 1000).getTime() / 1000
  )

  const token = jwt.sign(
    { uid: user.id, iat, exp, email: user.email, destroyAfterUse },
    env.server.jwtSecret
  )

  await redisDataSource.redisClient?.set(
    verificationTokenKey(token),
    user.id,
    'EX',
    expireInSeconds
  )

  return token
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
    (req.cookies.auth as string | undefined)
  )
}

export const isSystemRequest = (req: express.Request): boolean => {
  const token = getTokenByRequest(req)
  if (!token) {
    return false
  }

  try {
    const claims = jwt.verify(token, env.server.jwtSecret) as Claims
    return !!claims.system
  } catch (e) {
    return false
  }
}
