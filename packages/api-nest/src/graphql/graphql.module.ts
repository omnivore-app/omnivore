import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { join, resolve } from 'path'
import { AuthModule } from '../auth/auth.module'
import { AuthService } from '../auth/services/auth.service'
import { EnvVariables } from '../config/env-variables'

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService, AuthService],
      useFactory: async (
        configService: ConfigService,
        authService: AuthService,
      ) => {
        const isProduction =
          configService.get<string>(EnvVariables.NODE_ENV, 'development') ===
          'production'

        return {
          path: '/api/graphql',
          useGlobalPrefix: false,
          autoSchemaFile: resolve(__dirname, '..', '..', 'schema.graphql'),
          sortSchema: true,
          debug: !isProduction,
          playground: false,
          introspection: !isProduction,
          plugins: isProduction
            ? []
            : [ApolloServerPluginLandingPageLocalDefault({ footer: false })],
          context: async ({ req, res }: { req: any; res: any }) => {
            const request = req ?? { headers: {} }

            const authHeader =
              request.headers?.authorization ??
              request.headers?.Authorization ??
              request.cookies?.authToken

            if (authHeader && !request.user) {
              const user = await authService.validateToken(String(authHeader))
              if (user) {
                request.user = user
              }
            }

            return { req: request, res, user: request.user }
          },
        }
      },
    }),
  ],
})
export class GraphqlModule {}
