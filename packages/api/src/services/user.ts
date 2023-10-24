import { StatusType, User } from '../entity/user'
import { authTrx } from '../repository'
import { userRepository } from '../repository/user'

export const deleteUser = async (userId: string) => {
  await authTrx(
    async (t) => {
      await t.withRepository(userRepository).delete(userId)
    },
    undefined,
    userId
  )
}

export const updateUser = async (userId: string, update: Partial<User>) => {
  return authTrx(
    async (t) => t.getRepository(User).update(userId, update),
    undefined,
    userId
  )
}

export const findUser = async (id: string): Promise<User | null> => {
  return userRepository.findOneBy({ id, status: StatusType.Active })
}
