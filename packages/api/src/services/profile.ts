import { Profile } from '../entity/profile'
import { User } from '../entity/user'
import { getRepository } from '../repository'

export const findProfile = async (user: User): Promise<Profile | null> => {
  return getRepository(Profile).findOneBy({ user: { id: user.id } })
}

export const updateProfile = async (
  userId: string,
  profile: Partial<Profile>
): Promise<Profile> => {
  const profileRepository = getRepository(Profile)
  const existingProfile = await findProfile(user)

  if (!existingProfile) {
    return profileRepository.save({ ...profile, user })
  }

  const updatedProfile = { ...existingProfile, ...profile }
  return profileRepository.save(updatedProfile)
}
