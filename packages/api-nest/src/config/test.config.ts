import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'
import { User } from '../user/entities/user.entity'
import { UserProfile } from '../user/entities/profile.entity'
import { UserPersonalization } from '../user/entities/user-personalization.entity'
import { Filter } from '../filter/entities/filter.entity'
import { Group } from '../group/entities/group.entity'
import { Invite } from '../group/entities/invite.entity'
import { GroupMembership } from '../group/entities/group-membership.entity'

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [
    User,
    UserProfile,
    UserPersonalization,
    Filter,
    Group,
    Invite,
    GroupMembership,
  ],
  synchronize: true,
  logging: false,
}

export const createTestDataSource = () => {
  return new DataSource(testDatabaseConfig as DataSourceOptions)
}
