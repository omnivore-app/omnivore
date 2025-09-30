import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'
import {
  VerificationTokenPayload,
  VerificationTokenStore,
} from './interfaces/verification-token-store.interface'

@Injectable()
export class RedisVerificationTokenStore
  implements VerificationTokenStore, OnModuleDestroy
{
  private readonly logger = new Logger(RedisVerificationTokenStore.name)

  constructor(private readonly redis: Redis) {}

  async write(
    token: string,
    payload: VerificationTokenPayload,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redis.set(
      this.key(token),
      JSON.stringify(payload),
      'EX',
      ttlSeconds,
    )
  }

  async read(token: string): Promise<VerificationTokenPayload | undefined> {
    const raw = await this.redis.get(this.key(token))
    if (!raw) {
      return undefined
    }
    try {
      return JSON.parse(raw) as VerificationTokenPayload
    } catch (err) {
      this.logger.warn(`Failed to parse verification token payload: ${err}`)
      return undefined
    }
  }

  async delete(token: string): Promise<void> {
    await this.redis.del(this.key(token))
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis.status !== 'end') {
      await this.redis.quit()
    }
  }

  private key(token: string): string {
    return `email-verification:${token}`
  }
}
