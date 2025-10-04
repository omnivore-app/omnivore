import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserModule } from '../user/user.module'
import { LoggingModule } from '../logging/logging.module'
import { Filter } from '../filter/entities/filter.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './services/auth.service'
import { GoogleOAuthController } from './controllers/google-oauth.controller'
import { AppleOAuthController } from './controllers/apple-oauth.controller'
import { MobileAuthController } from './controllers/mobile-auth.controller'
import { GoogleOAuthService } from './services/google-oauth.service'
import { AppleOAuthService } from './services/apple-oauth.service'
import { PendingUserService } from './services/pending-user.service'
import { OAuthAuthService } from './services/oauth-auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { AuthResolver } from './auth.resolver'
import { EnvVariables } from '../config/env-variables'
import { EmailVerificationService } from './email-verification.service'
import { NotificationClient } from './interfaces/notification-client.interface'
import { ConsoleNotificationClient } from './console-notification.client'
import { QueueNotificationClient } from './queue-notification.client'
import { AnalyticsService } from '../analytics/analytics.service'
import { PubSubService } from '../pubsub/pubsub.service'
import { IntercomService } from '../integrations/intercom.service'
import { VerificationTokenStore } from './interfaces/verification-token-store.interface'
import { RedisVerificationTokenStore } from './redis-verification-token.store'
import { DefaultUserResourcesService } from './default-user-resources.service'
import { InMemoryVerificationTokenStore } from './in-memory-verification-token.store'
import Redis from 'ioredis'

@Module({
  imports: [
    UserModule, // Import user module for UserService
    LoggingModule, // Import logging module for StructuredLogger
    TypeOrmModule.forFeature([Filter]), // Import Filter repository for DefaultUserResourcesService
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(EnvVariables.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get<string>(
            EnvVariables.JWT_EXPIRES_IN,
            '1h',
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    GoogleOAuthController,
    AppleOAuthController,
    MobileAuthController,
  ],
  providers: [
    AuthService,
    GoogleOAuthService,
    AppleOAuthService,
    PendingUserService,
    OAuthAuthService,
    JwtStrategy,
    LocalStrategy,
    EmailVerificationService,
    DefaultUserResourcesService,
    AnalyticsService,
    PubSubService,
    IntercomService,
    {
      provide: NotificationClient,
      useClass: QueueNotificationClient,
    },
    {
      provide: VerificationTokenStore,
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>(
          EnvVariables.NODE_ENV,
          'development',
        )
        const redisUrl = configService.get<string>(EnvVariables.REDIS_URL)

        if (nodeEnv === 'test' || !redisUrl) {
          return new InMemoryVerificationTokenStore()
        }

        const tlsCert = configService.get<string>(EnvVariables.REDIS_TLS_CERT)

        const redis = new Redis(redisUrl, {
          lazyConnect: true,
          tls: tlsCert
            ? {
                ca: tlsCert,
                rejectUnauthorized: false,
              }
            : undefined,
        })

        return new RedisVerificationTokenStore(redis)
      },
      inject: [ConfigService],
    },
    AuthResolver,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
