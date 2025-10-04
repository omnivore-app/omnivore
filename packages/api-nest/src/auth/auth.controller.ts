import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Res,
  Headers,
} from '@nestjs/common'
import { Response } from 'express'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AuthService } from './services/auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ConfirmEmailDto } from './dto/confirm-email.dto'
import { ResendVerificationDto } from './dto/resend-verification.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import {
  LoginResponse,
  RegisterResponse,
  AuthVerificationResponse,
  AuthErrorCode,
  AuthStatus,
} from './dto/auth-responses.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login successful',
    type: 'LoginSuccessResponse',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or account issues',
    type: 'AuthErrorResponse',
  })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      )

      if (!user) {
        return {
          success: false,
          errorCode: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        }
      }

      if (!user.canAccess()) {
        // Handle pending verification or archived account
        if (user.status === 'PENDING') {
          return {
            success: false,
            errorCode: AuthErrorCode.PENDING_VERIFICATION,
            message: 'Please verify your email address',
          }
        } else {
          return {
            success: false,
            errorCode: AuthErrorCode.ACCOUNT_SUSPENDED,
            message: 'Your account has been suspended',
          }
        }
      }

      // Generate login result
      const loginResult = await this.authService.login(user)

      // Set auth cookie for web browser compatibility
      res.cookie('auth', loginResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        path: '/',
        sameSite: 'lax',
      })

      return loginResult
    } catch (error) {
      return {
        success: false,
        errorCode: AuthErrorCode.AUTH_FAILED,
        message: 'Authentication failed',
      }
    }
  }

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'Registration successful',
    type: 'RegisterResponse',
  })
  @ApiConflictResponse({ description: 'Email already exists' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    try {
      const result = await this.authService.register(registerDto)

      // Return the result directly from the service, which already has proper typing
      return result
    } catch (error) {
      // Handle specific registration errors
      if (error instanceof Error) {
        if (error.message.includes('EMAIL_ALREADY_EXISTS')) {
          return {
            success: false,
            errorCode: AuthErrorCode.EMAIL_ALREADY_EXISTS,
            message: 'An account with this email already exists',
          }
        }
        if (error.message.includes('INVALID_EMAIL')) {
          return {
            success: false,
            errorCode: AuthErrorCode.INVALID_EMAIL,
            message: 'Please provide a valid email address',
          }
        }
        if (error.message.includes('WEAK_PASSWORD')) {
          return {
            success: false,
            errorCode: AuthErrorCode.WEAK_PASSWORD,
            message: 'Password does not meet security requirements',
          }
        }
      }

      // Generic error
      return {
        success: false,
        errorCode: AuthErrorCode.REGISTRATION_FAILED,
        message: 'Registration failed. Please try again.',
      }
    }
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }

  @ApiOperation({ summary: 'Refresh JWT access token' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user)
  }

  @ApiOperation({ summary: 'Confirm email verification' })
  @ApiBody({ type: ConfirmEmailDto })
  @Post('confirm-email')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    try {
      const result = await this.authService.confirmEmail(confirmEmailDto.token)
      return result
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'EMAIL_VERIFICATION_TOKEN_NOT_FOUND'
      ) {
        throw new BadRequestException('Invalid or expired token')
      }
      throw error
    }
  }

  @ApiOperation({ summary: 'Resend email verification' })
  @ApiBody({ type: ResendVerificationDto })
  @Post('resend-verification')
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    try {
      const result = await this.authService.resendVerification(resendDto.email)
      return result
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        throw new BadRequestException('User not found')
      }
      if (error instanceof Error && error.message === 'USER_ALREADY_VERIFIED') {
        throw new BadRequestException('User already verified')
      }
      throw error
    }
  }

  @ApiOperation({ summary: 'Verify authentication status (for web frontend)' })
  @ApiOkResponse({
    description: 'Authentication status verified',
    type: 'AuthVerificationResponse',
  })
  @Get('verify')
  async verifyAuth(
    @Request() req,
    @Headers('authorization') authHeader?: string,
  ): Promise<AuthVerificationResponse> {
    try {
      // Check for auth token in header or cookie
      const token = authHeader || req.cookies?.auth

      if (!token) {
        return { authStatus: AuthStatus.NOT_AUTHENTICATED }
      }

      // Validate the token
      const user = await this.authService.validateToken(token)

      if (!user) {
        return { authStatus: AuthStatus.NOT_AUTHENTICATED }
      }

      if (!user.canAccess()) {
        if (user.status === 'PENDING') {
          return { authStatus: AuthStatus.PENDING_USER }
        } else {
          return { authStatus: AuthStatus.NOT_AUTHENTICATED }
        }
      }

      return {
        authStatus: AuthStatus.AUTHENTICATED,
        user: { id: user.id, email: user.email, name: user.name },
      }
    } catch (error) {
      return { authStatus: AuthStatus.NOT_AUTHENTICATED }
    }
  }
}
