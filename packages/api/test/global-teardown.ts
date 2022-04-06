import { AppDataSource } from '../src/server'

export const mochaGlobalTeardown = async () => {
  await AppDataSource.destroy()
  console.log('db connection closed')
}
