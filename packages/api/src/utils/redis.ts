import { createClient } from 'redis'
import { env } from '../env'

export const redisClient = createClient({
  url: env.redis.url,
  socket: {
    tls: env.redis.url?.startsWith('rediss://'), // rediss:// is the protocol for TLS
    cert: env.redis.cert?.replace(/\\n/g, '\n'), // replace \n with new line
    rejectUnauthorized: false, // for self-signed certs
    connectTimeout: 10000, // 10 seconds
    reconnectStrategy(retries: number): number | Error {
      if (retries > 10) {
        return new Error('Retries exhausted')
      }
      return 1000
    },
  },
})

export const connectRedisClient = async () => {
  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()
  console.log('Redis Client Connected')
}
