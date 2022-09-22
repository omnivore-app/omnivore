import { createClient } from 'redis'

export const createRedisClient = async (url?: string, cert?: string) => {
  const redisClient = createClient({
    url,
    socket: {
      tls: url?.startsWith('rediss://'),
      cert: cert?.replace(/\\n/g, '\n'),
      rejectUnauthorized: false,
    },
  })

  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()
  console.log('Redis Client Connected:', url)

  return redisClient
}
