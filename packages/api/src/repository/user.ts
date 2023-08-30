import { In } from 'typeorm'
import { entityManager } from '.'
import { User } from './../entity/user'

const TOP_USERS = [
  'jacksonh',
  'nat',
  'luis',
  'satindar',
  'malandrina',
  'patrick',
  'alexgutjahr',
  'hongbowu',
]
export const MAX_RECORDS_LIMIT = 1000

export const userRepository = entityManager.getRepository(User).extend({
  findById(id: string) {
    return this.findOneBy({ id })
  },

  findByEmail(email: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('LOWER(email) = LOWER(:email)', { email }) // case insensitive
      .getOne()
  },

  findTopUsers() {
    return this.createQueryBuilder()
      .where({
        profile: { username: In(TOP_USERS) },
      })
      .limit(MAX_RECORDS_LIMIT)
      .getMany()
  },
})
