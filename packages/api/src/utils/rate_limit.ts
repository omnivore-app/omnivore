import rateLimit, { MemoryStore, Options } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { env } from '../env'
import { redisDataSource } from '../redis_data_source'
import { getClaimsByToken, getTokenByRequest, isSystemRequest } from './auth'

// use the redis store if we have a redis connection
const redisClient = redisDataSource.redisClient
const getStore = (prefix?: string) =>
  redisClient
    ? new RedisStore({
        sendCommand: (command: string, ...args: string[]) =>
          redisClient.call(command, ...args) as never,
        prefix,
      })
    : new MemoryStore()

const configs: Partial<Options> = {
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  // skip preflight requests and test requests and system requests
  skip: (req) =>
    req.method === 'OPTIONS' || env.dev.isLocal || isSystemRequest(req),
  store: getStore('rate-limit'),
}

export const apiLimiter = rateLimit({
  ...configs,
  max: async (req) => {
    // 60 RPM for authenticated request, 15 for non-authenticated request
    const token = getTokenByRequest(req)
    try {
      const claims = await getClaimsByToken(token)
      return claims ? 60 : 15
    } catch (e) {
      return 15
    }
  },
  keyGenerator: (req) => {
    return getTokenByRequest(req) || req.ip || ''
  },
  store: getStore('api-rate-limit'),
})

export const apiHourLimiter = rateLimit({
  ...configs,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req) => {
    // 600 for authenticated request, 150 for non-authenticated request
    const token = getTokenByRequest(req)
    try {
      const claims = await getClaimsByToken(token)
      return claims ? 600 : 150
    } catch (e) {
      return 150
    }
  },
  keyGenerator: (req) => {
    return getTokenByRequest(req) || req.ip || ''
  },
  store: getStore('api-hour-rate-limit'),
})

// 5 RPM for auth requests
export const authLimiter = rateLimit({
  ...configs,
  store: getStore('auth-rate-limit'),
})

// The hourly limiter is used on the create account,
// and reset password endpoints
// this limits users to five operations per an hour
export const hourlyLimiter = rateLimit({
  ...configs,
  windowMs: 60 * 60 * 1000,
  store: getStore('hourly-rate-limit'),
})
