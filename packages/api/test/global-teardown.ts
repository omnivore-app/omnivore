import { appDataSource } from '../src/data_source'
import { redisClient } from '../src/redis'
import { stopApolloServer } from './util'

export const mochaGlobalTeardown = async () => {
  await stopApolloServer()
  console.log('apollo server stopped')

  await appDataSource.destroy()
  console.log('db connection closed')

  if (redisClient) {
    await redisClient.quit()
    console.log('redis connection closed')
  }
}
