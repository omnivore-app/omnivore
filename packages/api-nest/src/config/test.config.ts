import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'
import { User } from '../user/entities/user.entity'
import { UserProfile } from '../user/entities/profile.entity'
import { UserPersonalization } from '../user/entities/user-personalization.entity'
import { Filter } from '../filter/entities/filter.entity'
import { Group } from '../group/entities/group.entity'
import { Invite } from '../group/entities/invite.entity'
import { GroupMembership } from '../group/entities/group-membership.entity'
import { LibraryItemEntity } from '../library/entities/library-item.entity'
import { Label } from '../label/entities/label.entity'
import { EntityLabel } from '../label/entities/entity-label.entity'

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_DATABASE_HOST,
  port: Number.parseInt(process.env.TEST_DATABASE_PORT || '5432'),
  username: process.env.TEST_DATABASE_USER,
  password: process.env.TEST_DATABASE_PASSWORD,
  database: process.env.TEST_DATABASE_NAME,
  entities: [
    User,
    UserProfile,
    UserPersonalization,
    Filter,
    Group,
    Invite,
    GroupMembership,
    LibraryItemEntity,
    Label,
    EntityLabel,
  ],
  synchronize: false,
  logging: false,
}

export const createTestDataSource = () => {
  return new DataSource(testDatabaseConfig as DataSourceOptions)
}
