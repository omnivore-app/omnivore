import * as httpContext from 'express-http-context2'
import { EntityManager, EntityTarget, ObjectLiteral, Repository } from 'typeorm'
import { appDataSource } from '../data_source'
import { Claims } from '../resolvers/types'
import { SetClaimsRole } from '../utils/dictionary'

export const getColumns = <T extends ObjectLiteral>(
  repository: Repository<T>,
): (keyof T)[] => {
  return repository.metadata.columns.map(
    (col) => col.propertyName,
  ) as (keyof T)[]
}

export const setClaims = async (
  manager: EntityManager,
  uid = '00000000-0000-0000-0000-000000000000',
  userRole = 'user',
): Promise<unknown> => {
  const dbRole =
    userRole === SetClaimsRole.ADMIN ? 'omnivore_admin' : 'omnivore_user'
  return manager.query('SELECT * from omnivore.set_claims($1, $2)', [
    uid,
    dbRole,
  ])
}

export const authTrx = async <T>(
  fn: (manager: EntityManager) => Promise<T>,
  em = appDataSource.manager,
  uid?: string,
  userRole?: string,
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

export const getRepository = <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
) => {
  return appDataSource.getRepository(entity)
}
