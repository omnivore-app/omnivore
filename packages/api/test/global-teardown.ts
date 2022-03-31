import { appDataSource } from './db'

export const mochaGlobalTeardown = async () => {
  await appDataSource.destroy()
  console.log('db connection closed')
}
