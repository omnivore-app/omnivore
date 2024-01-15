import { env } from '../src/env'
import { redisDataSource } from '../src/redis_data_source'
import { createTestConnection } from './db'
import { startApolloServer } from './util'

export const mochaGlobalSetup = async () => {
  await createTestConnection()
  console.log('db connection created')

  if (env.redis.url) {
    await redisDataSource.initialize()
    console.log('redis connection created')
  }

  await startApolloServer()
  console.log('apollo server started')
}
