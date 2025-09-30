import { Inject, Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from '../config/env-variables'
import {
  VerificationTokenPayload,
  VerificationTokenStore,
} from './interfaces/verification-token-store.interface'

export interface CreateVerificationOptions {
  userId: string
  email?: string
}

export interface VerifyTokenOptions {
  consume?: boolean
}

@Injectable()
export class EmailVerificationService {
  private readonly ttlSeconds: number

  constructor(
    private readonly configService: ConfigService,
    @Inject(VerificationTokenStore)
    private readonly store: VerificationTokenStore,
  ) {
    this.ttlSeconds = this.configService.get<number>(
      EnvVariables.AUTH_EMAIL_TOKEN_TTL,
      60,
    )
  }

  async createVerificationToken(
    payload: CreateVerificationOptions,
  ): Promise<string> {
    const token = randomBytes(32).toString('hex')
    await this.store.write(
      token,
      { userId: payload.userId, email: payload.email },
      this.ttlSeconds,
    )
    return token
  }

  async verifyToken(
    token: string,
    options: VerifyTokenOptions = {},
  ): Promise<VerificationTokenPayload> {
    const record = await this.store.read(token)
    if (!record) {
      throw new Error('EMAIL_VERIFICATION_TOKEN_NOT_FOUND')
    }

    if (options.consume) {
      await this.store.delete(token)
    }

    return record
  }
}
