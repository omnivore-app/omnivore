import { createTestConnection } from './db'
import { startApolloServer } from './util'

export const mochaGlobalSetup = async () => {
  await createTestConnection()
  console.log('db connection created')

  await startApolloServer()
  console.log('apollo server started')
}
