import { appDataSource } from '../src/data_source'
import { redisDataSource } from '../src/redis_data_source'
import { stopApolloServer } from './util'

export const mochaGlobalTeardown = async () => {
  await stopApolloServer()
  console.log('apollo server stopped')

  await appDataSource.destroy()
  console.log('db connection closed')

  await redisDataSource.shutdown()
  console.log('redis connection closed')
}
