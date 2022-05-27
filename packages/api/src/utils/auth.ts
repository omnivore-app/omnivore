import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { Claims } from '../resolvers/types'
import { getRepository } from '../entity/utils'
import { ApiKey } from '../entity/api_key'

export const hashKey = (key: string, salt = 10) => {
  return bcrypt.hashSync(key, salt)
}

export const compareHashedKey = (rawKey: string, hash: string) => {
  return bcrypt.compareSync(rawKey, hash)
}

export const generateApiKey = (): string => {
  // TODO: generate random string key
  return uuidv4()
}

export const claimsFromApiKey = async (
  key: string
): Promise<Claims | undefined> => {
  const hashedKey = hashKey(key)
  const apiKey = await getRepository(ApiKey).findOne({
    where: { key: hashedKey },
    relations: ['user'],
  })
  if (!apiKey) {
    console.error('api key not found')
    return undefined
  }

  // update last used
  await getRepository(ApiKey).update(apiKey.id, { usedAt: new Date() })

  return {
    uid: apiKey.user.id,
    iat: new Date().getTime(),
    exp: apiKey.expiresAt.getTime(),
  }
}
