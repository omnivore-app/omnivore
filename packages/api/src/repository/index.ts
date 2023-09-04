import * as httpContext from 'express-http-context2'
import { EntityManager, EntityTarget } from 'typeorm'
import { appDataSource } from '../data_source'
import { Claims } from '../resolvers/types'

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
  em = entityManager,
  uid?: string,
  userRole?: string
): Promise<T> => {
  // if uid and dbRole are not passed in, then get them from the claims
  if (!uid && !userRole) {
    const claims: Claims | undefined = httpContext.get('claims')
    uid = claims?.uid
    userRole = claims?.userRole
  }

  return em.transaction(async (tx) => {
    await setClaims(tx, uid, userRole)
    return fn(tx)
  })
}

export const getRepository = <T>(entity: EntityTarget<T>) => {
  return entityManager.getRepository(entity)
}

export const entityManager = appDataSource.manager
