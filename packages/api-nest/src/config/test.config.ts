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
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'app_user',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'omnivore', // Use same DB as dev
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
  synchronize: false, // Use existing schema
  logging: false,
}

export const createTestDataSource = () => {
  return new DataSource(testDatabaseConfig as DataSourceOptions)
}
