import * as httpContext from 'express-http-context2'
import { EntityManager } from 'typeorm'
import { appDataSource } from '../data_source'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { logger } from '../utils/logger'

export const addPopularRead = async (
  userId: string,
  name: string,
  entityManager?: EntityManager
) => {
  return authTrx(
    async (tx) =>
      tx
        .withRepository(libraryItemRepository)
        .createByPopularRead(name, userId),
    {
      entityManager,
      uid: userId,
    }
  )
}

const addPopularReads = async (
  names: string[],
  userId: string,
  entityManager: EntityManager
) => {
  // insert one by one to ensure that the order is preserved
  for (const name of names) {
    try {
      await addPopularRead(userId, name, entityManager)
    } catch (error) {
      logger.error('failed to add popular read', error)
      continue
    }
  }
}

export const addPopularReadsForNewUser = async (
  userId: string,
  em = appDataSource.manager
): Promise<void> => {
  const defaultReads = ['omnivore_organize', 'power_read_it_later']

  // get client from request context
  const client = httpContext.get<string>('client')

  switch (client) {
    case 'web':
      defaultReads.push('omnivore_web')
      break
    case 'ios':
      defaultReads.push('omnivore_ios')
      break
    case 'android':
      defaultReads.push('omnivore_android')
      break
  }

  // We always want this to be the top-most article in the user's
  // list. So we save it last to have the greatest saved_at
  defaultReads.push('omnivore_get_started')
  await addPopularReads(defaultReads, userId, em)
}
