import { createClient } from 'redis'

export const createRedisClient = async (url?: string, cert?: string) => {
  const redisClient = createClient({
    url,
    socket: {
      tls: url?.startsWith('rediss://'), // rediss:// is the protocol for TLS
      cert: cert?.replace(/\\n/g, '\n'), // replace \n with new line
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

  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()
  console.log('Redis Client Connected:', url)

  return redisClient
}
