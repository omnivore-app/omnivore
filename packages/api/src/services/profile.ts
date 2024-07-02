import { Profile } from '../entity/profile'
import { User } from '../entity/user'
import { authTrx, getRepository } from '../repository'

export const findProfile = async (user: User): Promise<Profile | null> => {
  return getRepository(Profile).findOneBy({ user: { id: user.id } })
}

export const updateProfile = async (
  userId: string,
  profile: Partial<Profile>
) => {
  return authTrx(
    (tx) => {
      return tx.getRepository(Profile).update({ user: { id: userId } }, profile)
    },
    {
      uid: userId,
    }
  )
}
