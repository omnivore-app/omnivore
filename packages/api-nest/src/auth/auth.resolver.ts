import { Resolver, Query, Context } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { AuthPayload } from './graphql/auth-payload.type'
import { CurrentUser } from '../user/decorators/current-user.decorator'
import { User } from '../user/entities/user.entity'
import { EnvVariables } from '../config/env-variables'

@Resolver(() => AuthPayload)
export class AuthResolver {
  constructor(private readonly configService: ConfigService) {}

  @Query(() => AuthPayload, { name: 'session', nullable: true })
  @UseGuards(JwtAuthGuard)
  session(
    @CurrentUser() user: User,
    @Context('req') req: Request,
  ): AuthPayload | null {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return null
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, '')

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>(
        EnvVariables.JWT_EXPIRES_IN,
        '1h',
      ),
      user,
    }
  }
}
