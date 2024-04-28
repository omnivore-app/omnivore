import { In } from 'typeorm'
import { appDataSource } from '../data_source'
import { StatusType, User } from './../entity/user'

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

export const userRepository = appDataSource.getRepository(User).extend({
  findById(id: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.id = :id AND user.status = :status', {
        id,
        status: StatusType.Active,
      })
      .getOne()
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
      .take(MAX_RECORDS_LIMIT)
      .getMany()
  },
})
