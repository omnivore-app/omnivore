import { Profile } from '../entity/profile'
import { User } from '../entity/user'
import { getRepository } from '../repository'

export const findProfile = async (user: User): Promise<Profile | null> => {
  return getRepository(Profile).findOneBy({ user: { id: user.id } })
}
