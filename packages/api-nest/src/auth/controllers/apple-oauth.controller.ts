import { Controller, Post, Body, Logger, HttpStatus, Res } from '@nestjs/common'
import { Response } from 'express'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { OAuthAuthService } from '../services/oauth-auth.service'

interface AppleWebAuthDto {
  idToken: string
  user?: {
    name?: {
      firstName?: string
      lastName?: string
    }
    email?: string
  }
  isLocal?: boolean
  isVercel?: boolean
}

interface AppleMobileAuthDto {
  idToken: string
  user?: {
    name?: {
      firstName?: string
      lastName?: string
    }
    email?: string
  }
}

@ApiTags('apple-oauth')
@Controller('auth')
export class AppleOAuthController {
  private readonly logger = new Logger(AppleOAuthController.name)

  constructor(private readonly oauthAuthService: OAuthAuthService) {}

  @Post('apple-web-signin')
  @ApiOperation({ summary: 'Apple web authentication with ID token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string' },
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
        isLocal: { type: 'boolean' },
        isVercel: { type: 'boolean' },
      },
      required: ['idToken'],
    },
  })
  async appleWebSignIn(@Body() body: AppleWebAuthDto, @Res() res: Response) {
    try {
      const result = await this.oauthAuthService.handleAppleWebAuth(
        body.idToken,
        body.user,
        body.isLocal || false,
        body.isVercel || false,
      )

      if (result.authToken) {
        res.cookie('auth', result.authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        })
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        redirectURL: result.redirectURL,
        pendingUserAuth: result.pendingUserAuth,
      })
    } catch (error) {
      this.logger.error('Error in Apple web sign-in', error)
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'Authentication failed',
      })
    }
  }

  @Post('apple-mobile-signin')
  @ApiOperation({ summary: 'Apple mobile authentication' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string' },
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
      required: ['idToken'],
    },
  })
  async appleMobileSignIn(@Body() body: AppleMobileAuthDto) {
    try {
      const result = await this.oauthAuthService.handleAppleMobileAuth(
        body.idToken,
        body.user,
      )

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
      this.logger.error('Error in Apple mobile sign-in', error)
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        json: { error: 'Internal server error' },
      }
    }
  }
}
