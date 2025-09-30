import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  Logger,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger'
import { OAuthAuthService } from '../services/oauth-auth.service'
import { GoogleOAuthService } from '../services/google-oauth.service'

interface GoogleWebAuthDto {
  idToken: string
  isLocal?: boolean
  isVercel?: boolean
}

interface GoogleMobileAuthDto {
  idToken: string
  isAndroid: boolean
}

interface CompletePendingRegistrationDto {
  pendingToken: string
  name?: string
  username?: string
  bio?: string
}

@ApiTags('google-oauth')
@Controller('auth')
export class GoogleOAuthController {
  private readonly logger = new Logger(GoogleOAuthController.name)

  constructor(
    private readonly oauthAuthService: OAuthAuthService,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

  @Get('google-redirect/login')
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiQuery({ name: 'redirect_uri', required: false })
  async googleRedirectLogin(
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response,
  ) {
    try {
      const state = JSON.stringify({ redirect_uri: redirectUri || '' })
      const callbackUrl = '/api/auth/google-login/login'

      const authUrl = this.googleOAuthService.generateAuthUrl(
        callbackUrl,
        state,
      )

      this.logger.log('Redirecting to Google OAuth', { redirectUri })
      return res.redirect(authUrl)
    } catch (error) {
      this.logger.error('Error initiating Google OAuth', error)
      return res.redirect('/login?errorCodes=AuthFailed')
    }
  }

  @Get('google-login/login')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'state', required: false })
  async googleLoginCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        this.logger.warn('No authorization code provided')
        return res.redirect('/login?errorCodes=AuthFailed')
      }

      // Exchange code for user info
      const userInfo = await this.googleOAuthService.exchangeCodeForUserInfo(
        code,
        '/api/auth/google-login/login',
      )

      if (!userInfo || !userInfo.email) {
        this.logger.warn('Failed to get user info from Google')
        return res.redirect('/login?errorCodes=GoogleAuthError')
      }

      // Handle the authentication using the ID token approach
      // Note: In a full implementation, we'd need to generate an ID token from userInfo
      // For now, we'll use the web auth flow directly
      const result = await this.oauthAuthService.handleGoogleWebAuth(
        '', // We don't have idToken from code flow, need to adapt
        false, // isLocal
        false, // isVercel
      )

      if (result.authToken) {
        // Set auth cookie and redirect
        res.cookie('auth', result.authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        })
      }

      return res.redirect(result.redirectURL)
    } catch (error) {
      this.logger.error('Error in Google OAuth callback', error)
      return res.redirect('/login?errorCodes=AuthFailed')
    }
  }

  @Post('google-web-signin')
  @ApiOperation({ summary: 'Google web authentication with ID token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string' },
        isLocal: { type: 'boolean' },
        isVercel: { type: 'boolean' },
      },
      required: ['idToken'],
    },
  })
  async googleWebSignIn(@Body() body: GoogleWebAuthDto, @Res() res: Response) {
    try {
      const result = await this.oauthAuthService.handleGoogleWebAuth(
        body.idToken,
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
      this.logger.error('Error in Google web sign-in', error)
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'Authentication failed',
      })
    }
  }

  @Post('google-mobile-signin')
  @ApiOperation({ summary: 'Google mobile authentication' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string' },
        isAndroid: { type: 'boolean' },
      },
      required: ['idToken', 'isAndroid'],
    },
  })
  async googleMobileSignIn(@Body() body: GoogleMobileAuthDto) {
    try {
      const result = await this.oauthAuthService.handleGoogleMobileAuth(
        body.idToken,
        body.isAndroid,
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
      this.logger.error('Error in Google mobile sign-in', error)
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        json: { error: 'Internal server error' },
      }
    }
  }

  @Post('complete-oauth-registration')
  @ApiOperation({ summary: 'Complete OAuth registration from pending token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pendingToken: { type: 'string' },
        name: { type: 'string' },
        username: { type: 'string' },
        bio: { type: 'string' },
      },
      required: ['pendingToken'],
    },
  })
  async completePendingRegistration(
    @Body() body: CompletePendingRegistrationDto,
  ) {
    try {
      const result =
        await this.oauthAuthService.completePendingUserRegistration(
          body.pendingToken,
          {
            name: body.name,
            username: body.username,
            bio: body.bio,
          },
        )

      return {
        success: true,
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      }
    } catch (error) {
      this.logger.error('Error completing OAuth registration', error)

      if (
        error instanceof Error &&
        error.message.includes('Invalid or expired')
      ) {
        return {
          success: false,
          error: 'Invalid or expired pending user token',
        }
      }

      return {
        success: false,
        error: 'Registration failed',
      }
    }
  }
}
