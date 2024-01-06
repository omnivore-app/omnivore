import { DeepPartial, FindOptionsWhere, In } from 'typeorm'
import { StatusType, User } from '../entity/user'
import { authTrx, getRepository, queryBuilderToRawSql } from '../repository'
import { userRepository } from '../repository/user'
import { SetClaimsRole } from '../utils/dictionary'

export const deleteUser = async (userId: string) => {
  await authTrx(
    async (t) => {
      await t.withRepository(userRepository).delete(userId)
    },
    undefined,
    userId,
  )
}

export const updateUser = async (userId: string, update: Partial<User>) => {
  return authTrx(
    async (t) => t.getRepository(User).update(userId, update),
    undefined,
    userId,
  )
}

export const findActiveUser = async (id: string): Promise<User | null> => {
  return userRepository.findOneBy({ id, status: StatusType.Active })
}

export const findUsersById = async (ids: string[]): Promise<User[]> => {
  return userRepository.findBy({ id: In(ids) })
}

export const deleteUsers = async (criteria: FindOptionsWhere<User>) => {
  return authTrx(
    async (t) => t.getRepository(User).delete(criteria),
    undefined,
    undefined,
    SetClaimsRole.ADMIN,
  )
}

export const createUsers = async (users: DeepPartial<User>[]) => {
  return authTrx(
    async (t) => t.getRepository(User).save(users),
    undefined,
    undefined,
    SetClaimsRole.ADMIN,
  )
}

export const batchDelete = async (criteria: FindOptionsWhere<User>) => {
  const userQb = getRepository(User).createQueryBuilder().where(criteria)
  const userCountSql = queryBuilderToRawSql(userQb.select('COUNT(1)'))
  const userSubQuery = queryBuilderToRawSql(
    userQb.select('array_agg(id::UUID) into user_ids'),
  )

  const batchSize = 1000
  const sql = `
  -- Set batch size
  DO $$
  DECLARE 
      batch_size INT := ${batchSize};
      user_ids UUID[];
  BEGIN
      -- Loop through batches of users
      FOR i IN 0..CEIL((${userCountSql}) * 1.0 / batch_size) - 1 LOOP
          -- GET batch of user ids
          ${userSubQuery} LIMIT batch_size;
          
          -- Loop through batches of items
          FOR j IN 0..CEIL((SELECT COUNT(1) FROM omnivore.library_item WHERE user_id = ANY(user_ids)) * 1.0 / batch_size) - 1 LOOP
              -- Delete batch of items
              DELETE FROM omnivore.library_item
              WHERE id = ANY(
                SELECT id
                FROM omnivore.library_item
                WHERE user_id = ANY(user_ids)
                LIMIT batch_size
              );
          END LOOP;

          -- Delete the batch of users
          DELETE FROM omnivore.user WHERE id = ANY(user_ids);
      END LOOP;
  END $$
  `

  return authTrx(
    async (t) => t.query(sql),
    undefined,
    undefined,
    SetClaimsRole.ADMIN,
  )
}
