import { env } from '../src/env'
import { redisClient } from '../src/redis'
import { createTestConnection } from './db'
import { startApolloServer } from './util'

export const mochaGlobalSetup = async () => {
  await createTestConnection()
  console.log('db connection created')

  if (env.redis.url) {
    await redisClient.connect()
    console.log('redis connection created')
  }

  await startApolloServer()
  console.log('apollo server started')
}
