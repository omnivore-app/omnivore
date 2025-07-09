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
      startWorker({
        host: redisDataSource.workerRedisClient.options.host,
        port: redisDataSource.workerRedisClient.options.port,
        password: redisDataSource.workerRedisClient.options.password,
        db: redisDataSource.workerRedisClient.options.db,
      })
      console.log('worker started')
    }
  }

  await startApolloServer()
  console.log('apollo server started')
}
