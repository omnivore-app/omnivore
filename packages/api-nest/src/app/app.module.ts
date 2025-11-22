import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '../database/database.module'
import { HealthModule } from '../health/health.module'
import { AuthModule } from '../auth/auth.module'
import { UserModule } from '../user/user.module'
import { LoggingModule } from '../logging/logging.module'
import { GraphqlModule } from '../graphql/graphql.module'
import { LibraryModule } from '../library/library.module'
import { LabelModule } from '../label/label.module'
import { HighlightModule } from '../highlight/highlight.module'
import { ReadingProgressModule } from '../reading-progress/reading-progress.module'
import { QueueModule } from '../queue/queue.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { configValidationSchema } from '../config/config.schema'

@Module({
  imports: [
    // Global configuration with Joi validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`, // .env.test, .env.development, .env.production
        '.env', // Fallback for any missing vars
      ],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true, // Allow other env vars not in schema
        abortEarly: false, // Show all validation errors
      },
    }),

    // Structured logging with correlation IDs
    LoggingModule,

    // Database connection
    DatabaseModule,

    // Health checks
    HealthModule,

    // User management
    UserModule,

    // Authentication
    AuthModule,

    // Library / Reader
    LibraryModule,

    // Labels
    LabelModule,

    // Highlights
    HighlightModule,

    // Reading Progress (Sentinel-based)
    ReadingProgressModule,

    // Queue and Background Processing
    QueueModule,

    // GraphQL API
    GraphqlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
