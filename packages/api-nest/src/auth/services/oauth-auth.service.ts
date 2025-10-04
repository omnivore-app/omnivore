import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserService } from '../../user/user.service'
import { AuthService } from './auth.service'
import { GoogleOAuthService } from './google-oauth.service'
import { AppleOAuthService } from './apple-oauth.service'
import { PendingUserService } from './pending-user.service'
import {
  AuthProvider,
  OAuthUserInfo,
  GoogleWebAuthResponse,
} from '../interfaces/oauth-types.interface'
import {
  User,
  StatusType,
  RegistrationType,
} from '../../user/entities/user.entity'
import { EnvVariables } from '../../config/env-variables'

@Injectable()
export class OAuthAuthService {
  private readonly logger = new Logger(OAuthAuthService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly appleOAuthService: AppleOAuthService,
    private readonly pendingUserService: PendingUserService,
  ) {}

  /**
   * Handle Google web authentication flow
   */
  async handleGoogleWebAuth(
    idToken: string,
    isLocal = false,
    isVercel = false,
  ): Promise<GoogleWebAuthResponse> {
    const baseURL = this.getBaseURL(isLocal, isVercel)
    const authFailedRedirect = `${baseURL}/login?errorCodes=AuthFailed`

    try {
      // Verify the Google ID token
      const userInfo = await this.googleOAuthService.verifyWebToken(idToken)
      if (!userInfo || !userInfo.email) {
        this.logger.warn('Invalid Google token or missing email')
        return { redirectURL: authFailedRedirect }
      }

      // Look for existing user by email and source
      const existingUser = await this.userService.findByEmailAndSource(
        userInfo.email,
        RegistrationType.GOOGLE,
      )

      if (!existingUser) {
        // User doesn't exist, create pending user token for profile completion
        const pendingUserAuth =
          await this.pendingUserService.createPendingUserToken({
            email: userInfo.email,
            sourceUserId: userInfo.sourceUserId,
            provider: 'GOOGLE',
            name: userInfo.name || '',
            username: this.pendingUserService.generateSuggestedUsername(
              userInfo.name || '',
            ),
          })

        if (!pendingUserAuth) {
          this.logger.error('Failed to create pending user token')
          return { redirectURL: authFailedRedirect }
        }

        this.logger.log(
          'User does not exist, redirecting to profile completion',
          {
            email: userInfo.email,
            sourceUserId: userInfo.sourceUserId,
          },
        )

        return {
          redirectURL: `${baseURL}/confirm-profile`,
          pendingUserAuth,
        }
      }

      // User exists, check if they can access the system
      if (!existingUser.canAccess()) {
        const redirectPath =
          existingUser.status === StatusType.ARCHIVED
            ? '/archived-account'
            : '/login?errorCodes=AccountSuspended'

        return { redirectURL: `${baseURL}${redirectPath}` }
      }

      // Generate auth token for existing user
      const authToken = await this.createWebAuthToken(existingUser.id)
      if (!authToken) {
        this.logger.error('Failed to create auth token for existing user')
        return { redirectURL: authFailedRedirect }
      }

      let redirectURL = `${baseURL}/home`

      // Handle SSO for Vercel deployments
      if (isVercel) {
        const ssoToken = this.createSsoToken(authToken, redirectURL)
        redirectURL = this.getSsoRedirectURL(ssoToken)
      }

      this.logger.log('Google authentication successful', {
        userId: existingUser.id,
        email: existingUser.email,
      })

      return {
        authToken,
        redirectURL,
      }
    } catch (error) {
      this.logger.error('Error in Google web authentication', error)
      return { redirectURL: authFailedRedirect }
    }
  }

  /**
   * Handle Google mobile authentication
   */
  async handleGoogleMobileAuth(
    idToken: string,
    isAndroid: boolean,
  ): Promise<{
    success: boolean
    authToken?: string
    pendingUserAuth?: string
  }> {
    try {
      const tokenResult = await this.googleOAuthService.decodeGoogleToken(
        idToken,
        isAndroid,
      )

      if (
        tokenResult.errorCode ||
        !tokenResult.email ||
        !tokenResult.sourceUserId
      ) {
        this.logger.warn('Invalid Google mobile token', tokenResult)
        return { success: false }
      }

      // Look for existing user
      const existingUser = await this.userService.findByEmailAndSource(
        tokenResult.email,
        RegistrationType.GOOGLE,
      )

      if (!existingUser) {
        // Create pending user token for mobile registration
        const pendingUserAuth =
          await this.pendingUserService.createPendingUserToken({
            email: tokenResult.email,
            sourceUserId: tokenResult.sourceUserId,
            provider: 'GOOGLE',
            name: tokenResult.name || '',
            username: this.pendingUserService.generateSuggestedUsername(
              tokenResult.name || '',
            ),
          })

        if (!pendingUserAuth) {
          return { success: false }
        }

        return { success: true, pendingUserAuth }
      }

      if (!existingUser.canAccess()) {
        this.logger.warn('User cannot access system', {
          userId: existingUser.id,
          status: existingUser.status,
        })
        return { success: false }
      }

      // Generate auth token
      const authToken = await this.createWebAuthToken(existingUser.id)
      if (!authToken) {
        return { success: false }
      }

      return { success: true, authToken }
    } catch (error) {
      this.logger.error('Error in Google mobile authentication', error)
      return { success: false }
    }
  }

  /**
   * Handle Apple web authentication flow
   */
  async handleAppleWebAuth(
    idToken: string,
    appleUserData?: {
      name?: { firstName?: string; lastName?: string }
      email?: string
    },
    isLocal = false,
    isVercel = false,
  ): Promise<GoogleWebAuthResponse> {
    const baseURL = this.getBaseURL(isLocal, isVercel)
    const authFailedRedirect = `${baseURL}/login?errorCodes=AuthFailed`

    try {
      // Verify the Apple ID token
      const userInfo = await this.appleOAuthService.verifyAppleToken(
        idToken,
        appleUserData,
      )
      if (!userInfo || !userInfo.email) {
        this.logger.warn('Invalid Apple token or missing email')
        return { redirectURL: authFailedRedirect }
      }

      // Look for existing user by email and source
      const existingUser = await this.userService.findByEmailAndSource(
        userInfo.email,
        RegistrationType.APPLE,
      )

      if (!existingUser) {
        // User doesn't exist, create pending user token for profile completion
        const pendingUserAuth =
          await this.pendingUserService.createPendingUserToken({
            email: userInfo.email,
            sourceUserId: userInfo.sourceUserId,
            provider: 'APPLE',
            name: userInfo.name || '',
            username: this.pendingUserService.generateSuggestedUsername(
              userInfo.name || '',
            ),
          })

        if (!pendingUserAuth) {
          this.logger.error('Failed to create pending user token')
          return { redirectURL: authFailedRedirect }
        }

        this.logger.log(
          'User does not exist, redirecting to profile completion',
          {
            email: userInfo.email,
            sourceUserId: userInfo.sourceUserId,
          },
        )

        return {
          redirectURL: `${baseURL}/confirm-profile`,
          pendingUserAuth,
        }
      }

      // User exists, check if they can access the system
      if (!existingUser.canAccess()) {
        const redirectPath =
          existingUser.status === StatusType.ARCHIVED
            ? '/archived-account'
            : '/login?errorCodes=AccountSuspended'

        return { redirectURL: `${baseURL}${redirectPath}` }
      }

      // Generate auth token for existing user
      const authToken = await this.createWebAuthToken(existingUser.id)
      if (!authToken) {
        this.logger.error('Failed to create auth token for existing user')
        return { redirectURL: authFailedRedirect }
      }

      let redirectURL = `${baseURL}/home`

      // Handle SSO for Vercel deployments
      if (isVercel) {
        const ssoToken = this.createSsoToken(authToken, redirectURL)
        redirectURL = this.getSsoRedirectURL(ssoToken)
      }

      this.logger.log('Apple authentication successful', {
        userId: existingUser.id,
        email: existingUser.email,
      })

      return {
        authToken,
        redirectURL,
      }
    } catch (error) {
      this.logger.error('Error in Apple web authentication', error)
      return { redirectURL: authFailedRedirect }
    }
  }

  /**
   * Handle Apple mobile authentication
   */
  async handleAppleMobileAuth(
    idToken: string,
    appleUserData?: {
      name?: { firstName?: string; lastName?: string }
      email?: string
    },
  ): Promise<{
    success: boolean
    authToken?: string
    pendingUserAuth?: string
  }> {
    try {
      const userInfo = await this.appleOAuthService.verifyAppleToken(
        idToken,
        appleUserData,
      )

      if (!userInfo || !userInfo.email || !userInfo.sourceUserId) {
        this.logger.warn('Invalid Apple mobile token', userInfo)
        return { success: false }
      }

      // Look for existing user
      const existingUser = await this.userService.findByEmailAndSource(
        userInfo.email,
        RegistrationType.APPLE,
      )

      if (!existingUser) {
        // Create pending user token for mobile registration
        const pendingUserAuth =
          await this.pendingUserService.createPendingUserToken({
            email: userInfo.email,
            sourceUserId: userInfo.sourceUserId,
            provider: 'APPLE',
            name: userInfo.name || '',
            username: this.pendingUserService.generateSuggestedUsername(
              userInfo.name || '',
            ),
          })

        if (!pendingUserAuth) {
          return { success: false }
        }

        return { success: true, pendingUserAuth }
      }

      if (!existingUser.canAccess()) {
        this.logger.warn('User cannot access system', {
          userId: existingUser.id,
          status: existingUser.status,
        })
        return { success: false }
      }

      // Generate auth token
      const authToken = await this.createWebAuthToken(existingUser.id)
      if (!authToken) {
        return { success: false }
      }

      return { success: true, authToken }
    } catch (error) {
      this.logger.error('Error in Apple mobile authentication', error)
      return { success: false }
    }
  }

  /**
   * Complete OAuth registration from pending user token
   */
  async completePendingUserRegistration(
    pendingToken: string,
    profileData: { name?: string; username?: string; bio?: string },
  ) {
    const pendingUser =
      this.pendingUserService.decodePendingUserToken(pendingToken)
    if (!pendingUser) {
      throw new Error('Invalid or expired pending user token')
    }

    // Determine registration type from provider
    const source =
      pendingUser.provider === 'GOOGLE'
        ? RegistrationType.GOOGLE
        : RegistrationType.APPLE

    // Register the user
    const result = await this.userService.registerUser({
      email: pendingUser.email,
      name: profileData.name || pendingUser.name,
      username: profileData.username || pendingUser.username,
      bio: profileData.bio,
      requireEmailConfirmation: false, // OAuth users don't need email confirmation
      sourceUserId: pendingUser.sourceUserId,
      registrationType: source,
    })

    // Log in the newly created user
    return this.authService.login(result.user)
  }

  /**
   * Get base URL for redirects based on environment
   */
  private getBaseURL(isLocal: boolean, isVercel: boolean): string {
    if (isLocal) {
      return 'http://localhost:3000'
    }

    if (isVercel) {
      // In a real implementation, this would use homePageURL() helper
      return this.configService.get<string>(
        EnvVariables.FRONTEND_URL,
        'https://omnivore.app',
      )
    }

    return this.configService.get<string>(
      EnvVariables.FRONTEND_URL,
      'https://omnivore.app',
    )
  }

  /**
   * Create web auth token (delegates to existing auth service)
   */
  private async createWebAuthToken(userId: string): Promise<string | null> {
    try {
      // This should use the same JWT creation logic as the existing auth service
      const payload = { sub: userId, email: '', role: 'user' }
      // For now, we'll use a simple approach - in a real implementation,
      // we'd need to access the JwtService directly or create a shared token service
      this.logger.log('Creating web auth token for user', { userId })
      return `mock_token_${userId}_${Date.now()}`
    } catch (error) {
      this.logger.error('Error creating web auth token', error)
      return null
    }
  }

  /**
   * Create SSO token (stub - needs full implementation)
   */
  private createSsoToken(authToken: string, redirectURL: string): string {
    // TODO: Implement SSO token creation logic
    // This is a complex feature that involves secure token exchange
    this.logger.log('SSO token creation requested', { redirectURL })
    return `sso_${authToken.substring(0, 20)}_${Date.now()}`
  }

  /**
   * Get SSO redirect URL (stub - needs full implementation)
   */
  private getSsoRedirectURL(ssoToken: string): string {
    // TODO: Implement SSO redirect URL logic
    const baseURL = this.configService.get<string>(EnvVariables.FRONTEND_URL)
    return `${baseURL}/sso?token=${ssoToken}`
  }
}
