import { env } from '../src/env'
import { redisDataSource } from '../src/redis_data_source'
import { createTestConnection } from './db'
import { startApolloServer, startWorker } from './util'

export const mochaGlobalSetup = async () => {
  await createTestConnection()
  console.log('db connection created')

  if (env.redis.cache.url) {
    await redisDataSource.initialize()
    console.log('redis connection created')

    if (redisDataSource.workerRedisClient) {
      startWorker(redisDataSource.workerRedisClient)
      console.log('worker started')
    }
  }

  await startApolloServer()
  console.log('apollo server started')
}
