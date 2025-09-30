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
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
} from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ConfirmEmailDto } from './dto/confirm-email.dto'
import { ResendVerificationDto } from './dto/resend-verification.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    )
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return this.authService.login(user)
  }

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiConflictResponse({ description: 'Email already exists' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
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
}
