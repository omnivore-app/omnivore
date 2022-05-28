import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { Claims } from '../resolvers/types'
import { getRepository } from '../entity/utils'
import { ApiKey } from '../entity/api_key'
import crypto from 'crypto'
import * as jwt from 'jsonwebtoken'
import { env } from '../env'

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
  const apiKey = await getRepository(ApiKey).findOne({
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
  await getRepository(ApiKey).update(apiKey.id, { usedAt: new Date() })

  return {
    uid: apiKey.user.id,
    iat,
    exp,
  }
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
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      console.log(`not a jwt token, checking api key`, { token })
      claims = await claimsFromApiKey(token)
    } else {
      throw e
    }
  }

  return claims
}
