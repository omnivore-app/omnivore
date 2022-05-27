import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

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
