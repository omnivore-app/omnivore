import { appDataSource } from '../src/data_source'
import { env } from '../src/env'
import { redisDataSource } from '../src/redis_data_source'
import { stopApolloServer, stopWorker } from './util'

export const mochaGlobalTeardown = async () => {
  await stopApolloServer()
  console.log('apollo server stopped')

  await appDataSource.destroy()
  console.log('db connection closed')

  if (env.redis.cache.url) {
    await redisDataSource.shutdown()
    console.log('redis connection closed')

    if (redisDataSource.workerRedisClient) {
      await stopWorker()
      console.log('worker closed')
    }
  }
}
