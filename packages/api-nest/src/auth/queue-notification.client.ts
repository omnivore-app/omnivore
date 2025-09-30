import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  NotificationClient,
  EmailVerificationPayload,
} from './interfaces/notification-client.interface'
import { EnvVariables } from '../config/env-variables'

// Job data structure matching the legacy system
export interface SendEmailJobData {
  userId: string
  to?: string
  from?: string
  subject?: string
  html?: string
  text?: string
  templateId?: string
  dynamicTemplateData?: Record<string, any>
  replyTo?: string
}

@Injectable()
export class QueueNotificationClient extends NotificationClient {
  private readonly logger = new Logger(QueueNotificationClient.name)

  constructor(private readonly configService: ConfigService) {
    super()
  }

  async sendEmailVerification(
    payload: EmailVerificationPayload,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      EnvVariables.FRONTEND_URL,
      'http://localhost:3000',
    )
    const confirmationTemplateId = this.configService.get<string>(
      'SENDGRID_CONFIRMATION_TEMPLATE_ID',
    )

    const verificationLink = `${frontendUrl}/auth/confirm-email/${payload.token}`

    const jobData: SendEmailJobData = {
      userId: 'system', // For system emails, we use 'system' as userId
      to: payload.email,
      templateId: confirmationTemplateId,
      dynamicTemplateData: {
        name: payload.name,
        link: verificationLink,
      },
    }

    // TODO: Replace with actual queue integration once BullMQ is available
    // For now, we'll log the job data that would be enqueued
    this.logger.log('Would enqueue email verification job:', {
      jobType: 'SEND_EMAIL_JOB',
      jobData,
      recipient: payload.email,
      template: 'email_verification',
    })

    // In the full implementation, this would be:
    // await this.emailQueue.add('send-email', jobData, {
    //   attempts: 1,
    //   priority: 'high'
    // })
  }
}
