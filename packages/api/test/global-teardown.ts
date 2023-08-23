import { AppDataSource } from '../src/data-source'
import { stopApolloServer } from './util'
import { kx } from '../src/datalayer/knex_config'

export const mochaGlobalTeardown = async () => {
  await AppDataSource.destroy()
  await kx.destroy()
  console.log('db connection closed')

  await stopApolloServer()
  console.log('apollo server stopped')
}
