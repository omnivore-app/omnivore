import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EnvVariables } from '../config/env-variables'
import { QueryPerformanceLogger } from './query-logger'
import { StructuredLogger } from '../logging/structured-logger.service'
import { LoggingModule } from '../logging/logging.module'
import { User, UserProfile, UserPersonalization } from '../user/entities'
import { Filter } from '../filter/entities/filter.entity'
import { Group } from '../group/entities/group.entity'
import { Invite } from '../group/entities/invite.entity'
import { GroupMembership } from '../group/entities/group-membership.entity'
import { LibraryItemEntity } from '../library/entities/library-item.entity'
import { Label } from '../label/entities/label.entity'
import { EntityLabel } from '../label/entities/entity-label.entity'
import { HighlightEntity } from '../highlight/entities/highlight.entity'
import { ReadingProgressEntity } from '../reading-progress/entities/reading-progress.entity'

@Module({
  imports: [
    LoggingModule, // Import to get access to StructuredLogger
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggingModule],
      useFactory: async (
        configService: ConfigService,
        structuredLogger: StructuredLogger,
      ) => {
        const isDevelopment =
          configService.get(EnvVariables.NODE_ENV) === 'development'

        return {
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
            HighlightEntity,
            ReadingProgressEntity,
          ],
          migrationsRun: false,
          synchronize: false,
          logging: ['query', 'warn', 'error'],
          // Use QueryPerformanceLogger to track slow queries
          logger: new QueryPerformanceLogger(structuredLogger, isDevelopment),
          // Log queries slower than 1 second (QueryPerformanceLogger handles >500ms as "slow")
          maxQueryExecutionTime: 1000,

          // Connection pool settings for production
          extra: {
            max: 20, // Maximum number of connections
            min: 5, // Minimum number of connections
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          },

          // Enable SSL in production
          ssl:
            configService.get(EnvVariables.NODE_ENV) === 'production'
              ? { rejectUnauthorized: false }
              : false,
        }
      },
      inject: [ConfigService, StructuredLogger],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
