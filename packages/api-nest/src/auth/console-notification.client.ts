import { Injectable, Logger } from '@nestjs/common'
import {
  EmailVerificationPayload,
  NotificationClient,
} from './interfaces/notification-client.interface'

@Injectable()
export class ConsoleNotificationClient extends NotificationClient {
  private readonly logger = new Logger(ConsoleNotificationClient.name)

  async sendEmailVerification(payload: EmailVerificationPayload): Promise<void> {
    this.logger.log(
      `Email verification requested for ${payload.email} (token: ${payload.token})`,
    )
  }
}
