import { getConnection } from 'typeorm'

export async function mochaGlobalTeardown() {
  await getConnection().close()
  console.log('db connection close')
}
