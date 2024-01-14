import { Redis } from 'ioredis'
import { env } from './env'
import { Redis } from 'ioredis'
import { RedisOptions } from 'bullmq'

const url = env.redis.url
const cert = env.redis.cert

export const redisClient = url
  ? new Redis(url, {
      connectTimeout: 10000, // 10 seconds
      tls: cert
        ? {
            cert,
            rejectUnauthorized: false, // for self-signed certs
          }
        : undefined,
      reconnectOnError: (err) => {
        const targetErrors = [/READONLY/, /ETIMEDOUT/]

        targetErrors.forEach((targetError) => {
          if (targetError.test(err.message)) {
            // Only reconnect when the error contains the keyword
            return true
          }
        })

        return false
      },
      retryStrategy: (times) => {
        if (times > 10) {
          // End reconnecting after a specific number of tries and flush all commands with a individual error
          return null
        }

        // reconnect after
        return Math.min(times * 50, 2000)
      },
      maxRetriesPerRequest: 1,
    })
  : null
