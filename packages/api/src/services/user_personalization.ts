import { DeepPartial } from 'typeorm'
import { UserPersonalization } from '../entity/user_personalization'
import { authTrx } from '../repository'

export const findUserPersonalization = async (userId: string) => {
  return authTrx(
    (t) =>
      t.getRepository(UserPersonalization).findOneBy({
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const deleteUserPersonalization = async (userId: string) => {
  return authTrx(
    (t) =>
      t.getRepository(UserPersonalization).delete({
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const saveUserPersonalization = async (
  userId: string,
  userPersonalization: DeepPartial<UserPersonalization>
) => {
  return authTrx(
    (t) => t.getRepository(UserPersonalization).save(userPersonalization),
    undefined,
    userId
  )
}
