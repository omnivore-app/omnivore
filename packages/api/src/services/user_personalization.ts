import { DeepPartial } from 'typeorm'
import { UserPersonalization } from '../entity/user_personalization'
import { authTrx } from '../repository'

export const findUserPersonalization = async (id: string, userId: string) => {
  return authTrx(
    (t) =>
      t.getRepository(UserPersonalization).findOneBy({
        id,
      }),
    undefined,
    userId
  )
}

export const deleteUserPersonalization = async (id: string, userId: string) => {
  return authTrx(
    (t) =>
      t.getRepository(UserPersonalization).delete({
        id,
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
