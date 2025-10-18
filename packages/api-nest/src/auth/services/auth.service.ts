import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { StructuredLogger } from '../../logging/structured-logger.service'
import { UserService } from '../../user/user.service'
import { User, StatusType } from '../../user/entities/user.entity'
import { RegisterDto } from '../dto/register.dto'
import { EnvVariables } from '../../config/env-variables'
import { EmailVerificationService } from '../email-verification.service'
import { DefaultUserResourcesService } from '../default-user-resources.service'
import { NotificationClient } from '../interfaces/notification-client.interface'
import { AnalyticsService } from '../../analytics/analytics.service'
import { PubSubService } from '../../pubsub/pubsub.service'
import { IntercomService } from '../../integrations/intercom.service'
import {
  LoginSuccessResponse,
  RegisterSuccessWithLoginResponse,
  RegisterSuccessWithVerificationResponse,
  AuthUserData,
} from '../dto/auth-responses.dto'

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat?: number
  exp?: number
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
    private emailVerificationService: EmailVerificationService,
    private defaultResources: DefaultUserResourcesService,
    private notificationClient: NotificationClient,
    private analytics: AnalyticsService,
    private pubsub: PubSubService,
    private intercom: IntercomService,
    private logger: StructuredLogger,
  ) {
    this.logger.setContext({ operation: 'auth' })
  }

  /**
   * Validate user credentials for authentication
   * @param email - User's email address
   * @param password - User's password (plaintext)
   * @returns User entity if credentials are valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    return this.userService.validateCredentials(email, password)
  }

  /**
   * Validate a JWT token and retrieve the associated user
   * @param token - JWT token (with or without 'Bearer ' prefix)
   * @returns User entity if token is valid, null otherwise
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace(/^Bearer\s+/, '')

      // Verify and decode the JWT token
      const payload = this.jwtService.verify(cleanToken) as JwtPayload

      if (!payload.sub) {
        return null
      }

      // Get user from database
      const user = await this.userService.findById(payload.sub)

      return user
    } catch (error) {
      this.logger.warn('Token validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Generate JWT token and login response for a user
   * Validates user status and tracks login analytics
   * @param user - User entity to login
   * @returns Login response with access token and user data
   * @throws UnauthorizedException if user account is not active
   */
  async login(user: User): Promise<LoginSuccessResponse> {
    this.logger
      .withContext({ userId: user.id, email: user.email })
      .log('User login attempt', { status: user.status, role: user.role })

    if (!user.canAccess()) {
      this.logger
        .withContext({ userId: user.id, email: user.email })
        .warn('Login denied - user account not active', { status: user.status })
      throw new UnauthorizedException('User account is not active')
    }

    const role = user.role ?? 'user'

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role,
    }

    // Track login event
    this.analytics.trackUserLogin(user.id, {
      email: user.email,
      role,
      status: user.status,
    })

    this.logger
      .withContext({ userId: user.id, email: user.email })
      .log('User login successful', {
        role,
        tokenExpiresIn: this.configService.get<string>(
          EnvVariables.JWT_EXPIRES_IN,
          '1h',
        ),
      })

    return {
      success: true,
      message: 'Login successful',
      // redirectUrl removed: Frontend should determine navigation based on its own routing logic
      // Legacy: index.tsx checks auth and redirects to DEFAULT_HOME_PATH
      // Vite: LoginPage navigates to /library on isAuthenticated change
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
      accessToken: this.jwtService.sign(payload),
      expiresIn: this.configService.get<string>(
        EnvVariables.JWT_EXPIRES_IN,
        '1h',
      ),
    }
  }

  /**
   * Register a new user account with complete user provisioning
   * Creates user, profile, default resources, and triggers analytics/notifications
   * Returns either immediate login or email verification response based on config
   * @param registerDto - User registration data (email, password, name, etc.)
   * @returns Login response or email verification response
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<
    RegisterSuccessWithLoginResponse | RegisterSuccessWithVerificationResponse
  > {
    this.logger.log('User registration started', {
      email: registerDto.email,
      hasInviteCode: !!registerDto.inviteCode,
    })

    // Delegate core user registration to UserService
    const result = await this.userService.registerUserComplete(registerDto)

    // Provision default resources for the new user
    // This includes default filters and example library items (in non-production envs)
    await this.defaultResources.provisionForUser(result.user.id, {
      username: result.profile.username,
    })

    // Analytics: Track user creation
    this.analytics.trackUserCreated(
      result.user.id,
      result.user.email,
      result.profile.username,
      {
        status: result.user.status,
        hasInviteCode: !!registerDto.inviteCode,
      },
    )

    // Pub/Sub: Notify other services about user creation
    await this.pubsub.userCreated(
      result.user.id,
      result.user.email,
      result.user.name,
      result.profile.username,
    )

    // Intercom: Create contact for customer support
    await this.intercom.createUserContact(
      result.user.id,
      result.user.email,
      result.user.name,
      result.profile.username,
      result.profile.pictureUrl,
      result.user.sourceUserId,
    )

    // Check if email confirmation is required
    const requireConfirmation = this.configService.get<boolean>(
      EnvVariables.AUTH_REQUIRE_EMAIL_CONFIRMATION,
      false,
    )

    // Handle email verification if required
    if (requireConfirmation) {
      const verificationToken =
        await this.emailVerificationService.createVerificationToken({
          userId: result.user.id,
          email: result.user.email,
        })

      await this.notificationClient.sendEmailVerification({
        email: result.user.email,
        name: result.user.name,
        token: verificationToken,
      })

      this.logger
        .withContext({ userId: result.user.id, email: result.user.email })
        .log('User registration completed - email verification required', {
          status: result.user.status,
        })

      return {
        success: true,
        message:
          'Registration successful. Please check your email for verification.',
        redirectUrl: '/auth/email-login',
        pendingEmailVerification: true,
      }
    }

    this.logger
      .withContext({ userId: result.user.id, email: result.user.email })
      .log('User registration completed - auto-login', {
        status: result.user.status,
      })

    return this.login(result.user)
  }

  /**
   * Generate a new access token for an authenticated user
   * @param user - User entity to generate token for
   * @returns New access token and expiration time
   */
  async refreshToken(user: User) {
    const role = user.role ?? 'user'

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role,
    }

    return {
      success: true,
      accessToken: this.jwtService.sign(payload),
      expiresIn: this.configService.get<string>(
        EnvVariables.JWT_EXPIRES_IN,
        '1h',
      ),
    }
  }

  /**
   * Find a user by their ID
   * @param id - User ID
   * @returns User entity if found, null otherwise
   */
  async findUserById(id: string): Promise<User | null> {
    return this.userService.findById(id)
  }

  /**
   * Confirm a user's email address using a verification token
   * Activates pending user accounts and returns login response
   * @param token - Email verification token
   * @returns Login response with access token
   * @throws NotFoundException if user not found
   */
  async confirmEmail(token: string) {
    const payload = await this.emailVerificationService.verifyToken(token, {
      consume: true,
    })

    const user = await this.userService.findById(payload.userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.status === StatusType.PENDING) {
      const activatedUser = await this.userService.activateUser(user.id)

      // Analytics: Track email verification
      this.analytics.trackEmailVerified(activatedUser.id, activatedUser.email, {
        wasActivated: true,
      })

      return this.login(activatedUser)
    }

    // Analytics: Track email verification for already active users
    this.analytics.trackEmailVerified(user.id, user.email, {
      wasActivated: false,
    })

    return this.login(user)
  }

  /**
   * Resend email verification for a pending user account
   * @param email - User's email address
   * @returns Success response
   * @throws NotFoundException if user not found
   * @throws BadRequestException if user already verified
   */
  async resendVerification(email: string) {
    const user = await this.userService.findByEmail(email.trim().toLowerCase())
    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.status !== StatusType.PENDING) {
      throw new BadRequestException(
        'Email already verified. Please login to continue.',
      )
    }

    const verificationToken =
      await this.emailVerificationService.createVerificationToken({
        userId: user.id,
        email: user.email,
      })

    await this.notificationClient.sendEmailVerification({
      email: user.email,
      name: user.name,
      token: verificationToken,
    })

    return {
      success: true,
      message: 'Verification email sent',
    }
  }
}
