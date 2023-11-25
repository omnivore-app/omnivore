import { DeepPartial, FindOptionsWhere, In } from 'typeorm'
import { StatusType, User } from '../entity/user'
import { authTrx } from '../repository'
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
