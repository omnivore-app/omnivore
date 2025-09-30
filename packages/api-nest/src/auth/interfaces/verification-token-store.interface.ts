export interface VerificationTokenPayload {
  userId: string
  email?: string
}

export abstract class VerificationTokenStore {
  abstract write(token: string, payload: VerificationTokenPayload, ttlSeconds: number): Promise<void>
  abstract read(token: string): Promise<VerificationTokenPayload | undefined>
  abstract delete(token: string): Promise<void>
}
