import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '../database/database.module'
import { HealthModule } from '../health/health.module'
import { AuthModule } from '../auth/auth.module'
import { UserModule } from '../user/user.module'
import { LoggingModule } from '../logging/logging.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { configValidationSchema } from '../config/config.schema'

@Module({
  imports: [
    // Global configuration with Joi validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
