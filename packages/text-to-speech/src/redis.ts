import { createClient } from 'redis'

export const createRedisClient = async () => {
  const redisClient = createClient({ url: process.env.REDIS_URL })

  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()

  return redisClient
}
