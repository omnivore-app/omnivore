import { getConnection } from 'typeorm'

export const mochaGlobalTeardown = async () => {
  await getConnection().close()
  console.log('db connection closed')
}
