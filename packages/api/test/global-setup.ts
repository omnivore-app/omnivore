import { createTestConnection } from './db'

export async function mochaGlobalSetup() {
  await createTestConnection()
  console.log('db connection create')
}
