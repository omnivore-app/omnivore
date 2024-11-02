import { env } from '../../env'
import { sendWithMailJet } from '../../services/send_emails'
import { findActiveUser } from '../../services/user'
import { Merge } from '../../util'
import { logger } from '../../utils/logger'
import { sendEmail } from '../../utils/sendEmail'

export const SEND_EMAIL_JOB = 'send-email'

type ContentType = { html: string } | { text: string } | { templateId: string }
export type SendEmailJobData = Merge<
  {
    userId: string
    to?: string
    from?: string
    subject?: string
    html?: string
    text?: string
    templateId?: string
    dynamicTemplateData?: Record<string, any>
    replyTo?: string
  },
  ContentType
>

export const sendEmailJob = async (data: SendEmailJobData) => {
  logger.info('sending email job:', { data })
  if (!data.to) {
    const user = await findActiveUser(data.userId)
    if (!user) {
      logger.error('user not found', data.userId)
      return false
    }

    data.to = user.email
  }

  if (process.env.USE_MAILJET && data.dynamicTemplateData) {
    return sendWithMailJet(data.to, data.dynamicTemplateData.link)
  }

  if (!data.html && !data.text && !data.templateId) {
    logger.error('no email content provided', data)
    return false
  }

  return sendEmail({
    ...data,
    from: data.from || env.sender.message,
  })
}
