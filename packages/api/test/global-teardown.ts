import { appDataSource } from '../src/data_source'
import { env } from '../src/env'
import { redisClient } from '../src/redis'
import { stopApolloServer } from './util'

export const mochaGlobalTeardown = async () => {
  await stopApolloServer()
  console.log('apollo server stopped')

  await appDataSource.destroy()
  console.log('db connection closed')

  if (env.redis.url) {
    await redisClient.disconnect()
    console.log('redis connection closed')
  }
}
