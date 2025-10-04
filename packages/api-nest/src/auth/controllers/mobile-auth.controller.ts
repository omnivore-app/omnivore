import { Controller, Post, Body, Logger, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { OAuthAuthService } from '../services/oauth-auth.service'
import { AuthService } from '../services/auth.service'
import { UserService } from '../../user/user.service'

interface MobileSignInDto {
  token: string
  provider: 'GOOGLE' | 'APPLE'
  isAndroid?: boolean
  user?: {
    name?: {
      firstName?: string
      lastName?: string
    }
    email?: string
  }
}

interface MobileEmailSignInDto {
  email: string
  password: string
}

interface MobileEmailSignUpDto {
  email: string
  name: string
  password: string
}

@ApiTags('mobile-auth')
@Controller('mobile-auth')
export class MobileAuthController {
  private readonly logger = new Logger(MobileAuthController.name)

  constructor(
    private readonly oauthAuthService: OAuthAuthService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('sign-in')
  @ApiOperation({ summary: 'Mobile OAuth sign-in (Google/Apple)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        provider: { type: 'string', enum: ['GOOGLE', 'APPLE'] },
        isAndroid: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            name: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
              },
            },
            email: { type: 'string' },
          },
        },
      },
      required: ['token', 'provider'],
    },
  })
  async mobileSignIn(@Body() body: MobileSignInDto) {
    try {
      let result

      if (body.provider === 'GOOGLE') {
        result = await this.oauthAuthService.handleGoogleMobileAuth(
          body.token,
          body.isAndroid || false,
        )
      } else if (body.provider === 'APPLE') {
        result = await this.oauthAuthService.handleAppleMobileAuth(
          body.token,
          body.user,
        )
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          json: { error: 'Unsupported provider' },
        }
      }

      if (!result.success) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          json: { error: 'Authentication failed' },
        }
      }

      return {
        statusCode: HttpStatus.OK,
        json: {
          success: true,
          authToken: result.authToken,
          pendingUserAuth: result.pendingUserAuth,
        },
      }
    } catch (error) {
      this.logger.error('Error in mobile OAuth sign-in', error)
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        json: { error: 'Internal server error' },
      }
    }
  }

  @Post('email-sign-in')
  @ApiOperation({ summary: 'Mobile email/password sign-in' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email', 'password'],
    },
  })
  async mobileEmailSignIn(@Body() body: MobileEmailSignInDto) {
    try {
      const user = await this.userService.validateCredentials(
        body.email,
        body.password,
      )

      if (!user) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          json: { error: 'Invalid credentials' },
        }
      }

      if (!user.canAccess()) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          json: { error: 'Account suspended or pending verification' },
        }
      }

      const loginResult = await this.authService.login(user)

      return {
        statusCode: HttpStatus.OK,
        json: {
          success: true,
          user: loginResult.user,
          authToken: loginResult.accessToken,
          expiresIn: loginResult.expiresIn,
        },
      }
    } catch (error) {
      this.logger.error('Error in mobile email sign-in', error)
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        json: { error: 'Internal server error' },
      }
    }
  }

  @Post('email-sign-up')
  @ApiOperation({ summary: 'Mobile email registration' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        name: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email', 'name', 'password'],
    },
  })
  async mobileEmailSignUp(@Body() body: MobileEmailSignUpDto) {
    try {
      const registerResult = await this.authService.register({
        email: body.email,
        name: body.name,
        password: body.password,
      })

      if ('pendingEmailVerification' in registerResult) {
        return {
          statusCode: HttpStatus.OK,
          json: {
            success: true,
            pendingEmailVerification: registerResult.pendingEmailVerification,
          },
        }
      }

      return {
        statusCode: HttpStatus.OK,
        json: {
          success: true,
          user: registerResult.user,
          authToken: registerResult.accessToken,
          expiresIn: registerResult.expiresIn,
        },
      }
    } catch (error) {
      this.logger.error('Error in mobile email sign-up', error)

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          return {
            statusCode: HttpStatus.CONFLICT,
            json: { error: 'User already exists' },
          }
        }
      }

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        json: { error: 'Registration failed' },
      }
    }
  }
}
