import { env } from '../../env'
import { sendWithMailJet } from '../../services/send_emails'
import { Merge } from '../../util'
import { logger } from '../../utils/logger'
import { sendEmail } from '../../utils/sendEmail'

export const SEND_EMAIL_JOB = 'send-email'

type ContentType = { html: string } | { text: string } | { templateId: string }
export type SendEmailJobData = Merge<
  {
    to: string
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
