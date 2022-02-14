import { createTestConnection } from './db'

export const mochaGlobalSetup = async () => {
  await createTestConnection()
  console.log('db connection created')
}
