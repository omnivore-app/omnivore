import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { env } from '../env'
import { Claims } from '../resolvers/types'

export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10)
}

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash)
}

export const generateApiKey = (claims: Claims): string => {
  return jwt.sign(claims, env.server.jwtSecret)
}
