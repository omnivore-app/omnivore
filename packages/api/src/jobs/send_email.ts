import { env } from '../env'
import { sendWithMailJet } from '../services/send_emails'
import { sendEmail } from '../utils/sendEmail'

export const SEND_CONFIRMATION_EMAIL_JOB = 'send-confirmation-email'

export interface SendConfirmationEmailData {
  emailAddress: string
  link: string
  templateData: Record<string, any>
}

export const sendConfirmationEmail = async (
  data: SendConfirmationEmailData
) => {
  if (process.env.USE_MAILJET) {
    return sendWithMailJet(data.emailAddress, data.link)
  }

  return sendEmail({
    from: env.sender.message,
    to: data.emailAddress,
    templateId: env.sendgrid.confirmationTemplateId,
    dynamicTemplateData: data.templateData,
  })
}
