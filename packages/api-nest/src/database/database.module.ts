import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EnvVariables } from '../config/env-variables'
import { User, UserProfile, UserPersonalization } from '../user/entities'
import { Filter } from '../filter/entities/filter.entity'
import { Group } from '../group/entities/group.entity'
import { Invite } from '../group/entities/invite.entity'
import { GroupMembership } from '../group/entities/group-membership.entity'
import { LibraryItemEntity } from '../library/entities/library-item.entity'
import { Label } from '../label/entities/label.entity'
import { EntityLabel } from '../label/entities/entity-label.entity'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(
          EnvVariables.DATABASE_HOST,
          'localhost',
        ),
        port: configService.get<number>(EnvVariables.DATABASE_PORT, 5432),
        username: configService.get<string>(
          EnvVariables.DATABASE_USER,
          'app_user',
        ),
        password: configService.get<string>(EnvVariables.DATABASE_PASSWORD),
        database: configService.get<string>(
          EnvVariables.DATABASE_NAME,
          'omnivore',
        ),

        // Entity configuration
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

        // Migration configuration
        // migrations: ['dist/database/migrations/*.js'],
        // migrationsTableName: 'typeorm_migrations',
        migrationsRun: false, // Don't auto-run migrations

        // Development settings
        synchronize: false, // Never use synchronize with existing database
        logging:
          configService.get(EnvVariables.NODE_ENV) === 'development'
            ? ['query', 'error']
            : ['error'],

        // Connection pool settings for production
        extra: {
          max: 20, // Maximum number of connections
          min: 5, // Minimum number of connections
          idle_timeout: 30000,
          connectionTimeoutMillis: 10000,
        },

        // Enable SSL in production
        ssl:
          configService.get(EnvVariables.NODE_ENV) === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
