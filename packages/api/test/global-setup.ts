import { createTestConnection } from './db'
import { initElasticsearch } from '../src/elastic'
import { startApolloServer } from './util'
import { connectRedisClient } from '../src/utils/redis'

export const mochaGlobalSetup = async () => {
  await createTestConnection()
  console.log('db connection created')

  await initElasticsearch()
  console.log('elasticsearch initialized')

  await connectRedisClient()
  console.log('redis client connected')

  await startApolloServer()
  console.log('apollo server started')
}
