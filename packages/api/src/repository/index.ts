import * as httpContext from 'express-http-context2'
import {
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryBuilder,
  QueryFailedError,
  Repository,
} from 'typeorm'
import { DatabaseError } from 'pg'
import { appDataSource } from '../data_source'
import { Claims } from '../resolvers/types'
import { SetClaimsRole } from '../utils/dictionary'

export enum SortOrder {
  ASCENDING = 'ASC',
  DESCENDING = 'DESC',
}

export interface Sort {
  by: string
  order?: SortOrder
  nulls?: 'NULLS FIRST' | 'NULLS LAST'
}

export interface Select {
  column: string
  alias?: string
}

export const paramtersToObject = (parameters: ObjectLiteral[]) => {
  return parameters.reduce((a, b) => ({ ...a, ...b }), {})
}

export const getColumns = <T extends ObjectLiteral>(
  repository: Repository<T>
): (keyof T)[] => {
  return repository.metadata.columns.map(
    (col) => col.propertyName
  ) as (keyof T)[]
}

export const getColumnsDbName = <T extends ObjectLiteral>(
  repository: Repository<T>
): string[] => {
  return repository.metadata.columns.map((col) => col.databaseName)
}

export const setClaims = async (
  manager: EntityManager,
  uid = '00000000-0000-0000-0000-000000000000',
  userRole = 'user'
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

export const getRepository = <T extends ObjectLiteral>(
  entity: EntityTarget<T>
) => {
  return appDataSource.getRepository(entity)
}

export const queryBuilderToRawSql = <T extends ObjectLiteral>(
  q: QueryBuilder<T>
): string => {
  const queryAndParams = q.getQueryAndParameters()
  let sql = queryAndParams[0]
  const params = queryAndParams[1]

  params.forEach((value, index) => {
    if (typeof value === 'string') {
      sql = sql.replace(`$${index + 1}`, `'${value}'`)
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        sql = sql.replace(
          `$${index + 1}`,
          "'{" +
            value
              .map((element) => {
                if (typeof element === 'string') {
                  return `"${element}"`
                }

                if (
                  typeof element === 'number' ||
                  typeof element === 'boolean'
                ) {
                  return element.toString()
                }
              })
              .join(',') +
            "}'"
        )
      } else if (value instanceof Date) {
        sql = sql.replace(`$${index + 1}`, `'${value.toISOString()}'`)
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sql = sql.replace(`$${index + 1}`, value.toString())
    }
  })

  return sql
}

export const valuesToRawSql = (
  values: Record<string, string | number | boolean>
): string => {
  let sql = ''

  Object.keys(values).forEach((key, index) => {
    const value = values[key]
    if (typeof value === 'string') {
      sql += `${key} = '${value}'`
    } else {
      sql += `${key} = ${value.toString()}`
    }

    if (index < Object.keys(values).length - 1) {
      sql += ', '
    }
  })

  return sql
}

const isQueryFailedError = (
  err: unknown
): err is QueryFailedError & DatabaseError => err instanceof QueryFailedError

export const isUniqueViolation = (err: unknown): boolean => {
  if (isQueryFailedError(err)) {
    return err.code === '23505'
  }

  return false
}
