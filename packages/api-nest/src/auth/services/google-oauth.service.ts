import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'
import { EnvVariables } from '../../config/env-variables'
import {
  DecodeTokenResult,
  OAuthUserInfo,
  GoogleWebAuthResponse,
} from '../interfaces/oauth-types.interface'

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name)
  private readonly webClient: OAuth2Client
  private readonly iosClient: OAuth2Client
  private readonly androidClient: OAuth2Client

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>(
      EnvVariables.GOOGLE_CLIENT_ID,
    )
    const clientSecret = this.configService.get<string>(
      EnvVariables.GOOGLE_CLIENT_SECRET,
    )
    const iosClientId = this.configService.get<string>(
      EnvVariables.GOOGLE_IOS_CLIENT_ID,
    )
    const androidClientId = this.configService.get<string>(
      EnvVariables.GOOGLE_ANDROID_CLIENT_ID,
    )

    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is required')
    }

    this.webClient = new OAuth2Client(clientId, clientSecret)
    this.iosClient = new OAuth2Client(iosClientId || clientId)
    this.androidClient = new OAuth2Client(androidClientId || clientId)
  }

  /**
   * Decode and verify Google ID token for mobile clients
   */
  async decodeGoogleToken(
    idToken: string,
    isAndroid: boolean,
  ): Promise<DecodeTokenResult> {
    try {
      const client = isAndroid ? this.androidClient : this.iosClient
      const audiences = [
        this.configService.get<string>(EnvVariables.GOOGLE_CLIENT_ID),
        this.configService.get<string>(EnvVariables.GOOGLE_IOS_CLIENT_ID),
        this.configService.get<string>(EnvVariables.GOOGLE_ANDROID_CLIENT_ID),
      ].filter(Boolean) as string[]

      const loginTicket = await client.verifyIdToken({
        idToken,
        audience: audiences,
      })

      const payload = loginTicket.getPayload()
      if (!payload) {
        this.logger.warn('No payload in Google token')
        return { errorCode: 401 }
      }

      const email = payload.email
      const sourceUserId = payload.sub
      const name = payload.name

      if (!email || !sourceUserId) {
        this.logger.warn('Missing email or sourceUserId in Google token')
        return { errorCode: 401 }
      }

      return { email, sourceUserId, name }
    } catch (error) {
      this.logger.error('Error decoding Google token', error)
      return { errorCode: 500 }
    }
  }

  /**
   * Verify Google ID token for web clients
   */
  async verifyWebToken(idToken: string): Promise<OAuthUserInfo | null> {
    try {
      const clientId = this.configService.get<string>(
        EnvVariables.GOOGLE_CLIENT_ID,
      )

      const loginTicket = await this.webClient.verifyIdToken({
        idToken,
        audience: clientId,
      })

      const payload = loginTicket.getPayload()
      if (!payload) {
        this.logger.warn('No payload in Google web token')
        return null
      }

      const email = payload.email
      const sourceUserId = payload.sub
      const name = payload.name
      const pictureUrl = payload.picture

      if (!email || !sourceUserId) {
        this.logger.warn('Missing email or sourceUserId in Google web token')
        return null
      }

      return {
        email,
        sourceUserId,
        name,
        pictureUrl,
      }
    } catch (error) {
      this.logger.error('Error verifying Google web token', error)
      return null
    }
  }

  /**
   * Generate Google OAuth URL for web authentication
   */
  generateAuthUrl(redirectUri: string, state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]

    return this.webClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: state,
      redirect_uri: redirectUri,
    })
  }

  /**
   * Exchange authorization code for user info (web OAuth flow)
   */
  async exchangeCodeForUserInfo(
    authCode: string,
    redirectUri: string,
  ): Promise<OAuthUserInfo | null> {
    try {
      // Exchange code for tokens with redirect URI
      const { tokens } = await this.webClient.getToken({
        code: authCode,
        redirect_uri: redirectUri,
      })
      this.webClient.setCredentials(tokens)

      // Get user info
      const userInfoResponse = await this.webClient.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      })

      const userInfo = userInfoResponse.data as any

      if (!userInfo.email || !userInfo.id) {
        this.logger.warn('Missing email or id in Google user info')
        return null
      }

      return {
        email: userInfo.email,
        sourceUserId: userInfo.id,
        name: userInfo.name,
        pictureUrl: userInfo.picture,
      }
    } catch (error) {
      this.logger.error('Error exchanging Google auth code', error)
      return null
    }
  }
}
