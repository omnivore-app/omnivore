import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import {
  PendingUserTokenPayload,
  isPendingUserTokenPayload,
} from '../interfaces/oauth-types.interface'
import { EnvVariables } from '../../config/env-variables'

@Injectable()
export class PendingUserService {
  private readonly logger = new Logger(PendingUserService.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a pending user token for incomplete OAuth registrations
   */
  async createPendingUserToken(
    payload: PendingUserTokenPayload,
  ): Promise<string | null> {
    try {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>(EnvVariables.JWT_SECRET),
        expiresIn: '15m', // Pending user tokens expire in 15 minutes
      })

      this.logger.log('Creating pending user token', {
        email: payload.email,
        provider: payload.provider,
      })

      return token
    } catch (error) {
      this.logger.error('Error creating pending user token', error)
      return null
    }
  }

  /**
   * Decode and verify a pending user token
   */
  decodePendingUserToken(token: string): PendingUserTokenPayload | null {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>(EnvVariables.JWT_SECRET),
      })

      if (isPendingUserTokenPayload(decoded)) {
        return decoded
      }

      this.logger.warn('Invalid pending user token payload structure')
      return null
    } catch (error) {
      this.logger.error('Error decoding pending user token', error)
      return null
    }
  }

  /**
   * Generate a suggested username from a name
   */
  generateSuggestedUsername(name: string): string {
    if (!name || name.length === 0) {
      return `user${Math.floor(Math.random() * 10000)}`
    }

    // Clean the name to create a base username
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    const maxLength = Math.floor(Math.random() * 6) + 6 // range: 6 - 11
    const prefix = cleanName.substring(0, Math.min(maxLength, cleanName.length))
    const suffix = Math.floor(Math.random() * 10000)

    return `${prefix}${suffix}`
  }
}
