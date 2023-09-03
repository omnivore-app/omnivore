import { EntityManager } from 'typeorm'
import { appDataSource } from '../data_source'

export const setClaims = async (
  manager: EntityManager,
  uid = '00000000-0000-0000-0000-000000000000',
  dbRole = 'omnivore_user'
): Promise<unknown> => {
  return manager.query('SELECT * from omnivore.set_claims($1, $2)', [
    uid,
    dbRole,
  ])
}

export const authTrx = async <T>(
  fn: (manager: EntityManager) => Promise<T>,
  uid = '00000000-0000-0000-0000-000000000000',
  dbRole = 'omnivore_user'
): Promise<T> => {
  return entityManager.transaction(async (tx) => {
    await setClaims(tx, uid, dbRole)
    return fn(tx)
  })
}

export const entityManager = appDataSource.manager
