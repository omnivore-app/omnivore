import { AppDataSource } from '../src/data-source'
import { stopApolloServer } from './util'

export const mochaGlobalTeardown = async () => {
  await stopApolloServer()
  console.log('apollo server stopped')

  await AppDataSource.destroy()
  console.log('db connection closed')
}
