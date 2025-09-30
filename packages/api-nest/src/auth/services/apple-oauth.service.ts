import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import * as jwkToPem from 'jwk-to-pem'
import { EnvVariables } from '../../config/env-variables'
import {
  DecodeTokenResult,
  OAuthUserInfo,
} from '../interfaces/oauth-types.interface'

interface AppleJWTHeader {
  kid: string
  alg: string
}

interface AppleJWTPayload {
  iss: string
  aud: string
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
  exp: number
  iat: number
}

interface AppleUserData {
  name?: {
    firstName?: string
    lastName?: string
  }
  email?: string
}

@Injectable()
export class AppleOAuthService {
  private readonly logger = new Logger(AppleOAuthService.name)
  private readonly appleBaseURL = 'https://appleid.apple.com'
  private readonly audienceName = 'app.omnivore.app'
  private readonly webAudienceName = 'app.omnivore'

  // In-memory cache for Apple public keys
  private publicKeyCache = new Map<string, { key: string; expiry: number }>()

  constructor(private readonly configService: ConfigService) {}

  /**
   * Decode and verify Apple ID token
   */
  async decodeAppleToken(token: string): Promise<DecodeTokenResult> {
    try {
      // Decode token to get header information
      const decodedToken = jwt.decode(token, { complete: true })
      if (!decodedToken || typeof decodedToken === 'string') {
        this.logger.warn('Invalid Apple token format')
        return { errorCode: 401 }
      }

      const header = decodedToken.header as AppleJWTHeader
      const { kid, alg } = header

      if (!kid || !alg) {
        this.logger.warn('Missing kid or alg in Apple token header')
        return { errorCode: 401 }
      }

      // Get Apple's public key
      const publicKey = await this.fetchApplePublicKey(kid)
      if (!publicKey) {
        this.logger.error('Failed to fetch Apple public key')
        return { errorCode: 500 }
      }

      // Verify the JWT
      const jwtClaims = jwt.verify(token, publicKey, {
        algorithms: [alg as jwt.Algorithm],
      }) as AppleJWTPayload

      // Verify issuer and audience
      const issVerified = jwtClaims.iss === this.appleBaseURL
      const audience = jwtClaims.aud
      const audVerified =
        audience === this.webAudienceName || audience === this.audienceName

      if (!issVerified) {
        this.logger.warn('Apple token issuer verification failed', {
          expected: this.appleBaseURL,
          actual: jwtClaims.iss,
        })
        return { errorCode: 401 }
      }

      if (!audVerified) {
        this.logger.warn('Apple token audience verification failed', {
          expected: [this.webAudienceName, this.audienceName],
          actual: audience,
        })
        return { errorCode: 401 }
      }

      if (!jwtClaims.email) {
        this.logger.warn('Apple token missing email claim')
        return { errorCode: 401 }
      }

      return {
        email: jwtClaims.email,
        sourceUserId: jwtClaims.sub,
        name: jwtClaims.name,
      }
    } catch (error) {
      this.logger.error('Error decoding Apple token', error)
      return { errorCode: 500 }
    }
  }

  /**
   * Verify Apple ID token and return user info
   */
  async verifyAppleToken(
    idToken: string,
    appleUserData?: AppleUserData,
  ): Promise<OAuthUserInfo | null> {
    try {
      const tokenResult = await this.decodeAppleToken(idToken)

      if (
        tokenResult.errorCode ||
        !tokenResult.email ||
        !tokenResult.sourceUserId
      ) {
        this.logger.warn('Invalid Apple token', tokenResult)
        return null
      }

      // Construct name from token or user data
      let name = tokenResult.name
      if (!name && appleUserData?.name) {
        const { firstName, lastName } = appleUserData.name
        name = [firstName, lastName].filter(Boolean).join(' ')
      }

      return {
        email: tokenResult.email,
        sourceUserId: tokenResult.sourceUserId,
        name: name || '',
        pictureUrl: undefined, // Apple doesn't provide profile pictures
      }
    } catch (error) {
      this.logger.error('Error verifying Apple token', error)
      return null
    }
  }

  /**
   * Fetch Apple's public key for JWT verification
   */
  private async fetchApplePublicKey(kid: string): Promise<string | null> {
    try {
      // Check cache first
      const cached = this.publicKeyCache.get(kid)
      if (cached && Date.now() < cached.expiry) {
        return cached.key
      }

      // Fetch Apple's JWKS
      const response = await fetch(`${this.appleBaseURL}/auth/keys`)
      if (!response.ok) {
        throw new Error(`Failed to fetch Apple JWKS: ${response.statusText}`)
      }

      const jwks = await response.json()
      const key = jwks.keys?.find((k: any) => k.kid === kid)

      if (!key) {
        this.logger.error('Apple public key not found', { kid })
        return null
      }

      // Convert JWK to PEM format
      const publicKey = this.jwkToPem(key)

      // Cache the key for 1 hour
      this.publicKeyCache.set(kid, {
        key: publicKey,
        expiry: Date.now() + 60 * 60 * 1000,
      })

      return publicKey
    } catch (error) {
      this.logger.error('Error fetching Apple public key', error)
      return null
    }
  }

  /**
   * Convert JWK to PEM format
   */
  private jwkToPem(jwk: any): string {
    try {
      return jwkToPem.default(jwk)
    } catch (error) {
      this.logger.error('Error converting JWK to PEM', error)
      throw new Error('Failed to convert JWK to PEM format')
    }
  }

  /**
   * Generate Apple Sign-In URL (for web flows)
   * Note: Apple Sign-In typically uses their JS SDK, but this could be useful for server-side flows
   */
  generateAppleSignInUrl(redirectUri: string, state?: string): string {
    const clientId = this.configService.get<string>(
      EnvVariables.APPLE_CLIENT_ID,
    )
    const baseUrl = 'https://appleid.apple.com/auth/authorize'

    const params = new URLSearchParams({
      client_id: clientId || this.audienceName,
      redirect_uri: redirectUri,
      response_type: 'code id_token',
      scope: 'name email',
      response_mode: 'form_post',
      ...(state && { state }),
    })

    return `${baseUrl}?${params.toString()}`
  }
}
