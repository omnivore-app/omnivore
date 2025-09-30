import { Injectable } from '@nestjs/common'
import {
  VerificationTokenPayload,
  VerificationTokenStore,
} from './interfaces/verification-token-store.interface'

@Injectable()
export class InMemoryVerificationTokenStore implements VerificationTokenStore {
  private readonly store = new Map<string, { payload: VerificationTokenPayload; expiresAt: number }>()

  async write(
    token: string,
    payload: VerificationTokenPayload,
    ttlSeconds: number,
  ): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000
    this.store.set(token, { payload, expiresAt })
  }

  async read(token: string): Promise<VerificationTokenPayload | undefined> {
    const record = this.store.get(token)
    if (!record) {
      return undefined
    }
    if (Date.now() > record.expiresAt) {
      this.store.delete(token)
      return undefined
    }
    return record.payload
  }

  async delete(token: string): Promise<void> {
    this.store.delete(token)
  }
}
