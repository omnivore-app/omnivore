import { Profile } from '../entity/profile'
import { entityManager } from '.'

export const profileRepository = entityManager.getRepository(Profile)
