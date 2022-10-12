import { createTestConnection } from './db'
import { initElasticsearch } from '../src/elastic'
import { startApolloServer } from './util'

export const mochaGlobalSetup = async () => {
  await createTestConnection()
  console.log('db connection created')

  await initElasticsearch()
  console.log('elasticsearch initialized')

  await startApolloServer()
  console.log('apollo server started')
}
