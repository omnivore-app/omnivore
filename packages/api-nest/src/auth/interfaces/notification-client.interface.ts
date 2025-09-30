export interface EmailVerificationPayload {
  email: string
  name: string
  token: string
}

export abstract class NotificationClient {
  abstract sendEmailVerification(payload: EmailVerificationPayload): Promise<void>
}
