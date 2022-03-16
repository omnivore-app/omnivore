import { createTestConnection } from './db'
import { initElasticsearch } from '../src/elastic'

export const mochaGlobalSetup = async () => {
  await createTestConnection()
  console.log('db connection created')

  await initElasticsearch()
  console.log('elasticsearch initialized')
}
