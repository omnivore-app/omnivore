import mailjet from 'node-mailjet'
import { env } from '../env'
import { generateVerificationToken } from '../utils/auth'
import { enqueueSendConfirmationEmail } from '../utils/createTask'
import { logger } from '../utils/logger'
import { sendEmail } from '../utils/sendEmail'

export const sendConfirmationEmail = async (user: {
  id: string
  name: string
  email: string
}) => {
  // generate confirmation link
  const token = generateVerificationToken({ id: user.id })
  const link = `${env.client.url}/auth/confirm-email/${token}`
  // send email
  const dynamicTemplateData = {
    name: user.name,
    link,
  }

  await enqueueSendConfirmationEmail({
    emailAddress: user.email,
    link,
    templateData: dynamicTemplateData,
  })
}

export const sendWithMailJet = async (
  email: string,
  link: string
): Promise<boolean> => {
  if (!process.env.MAILJET_API_KEY || !process.env.MAILGET_SECRET_KEY) {
    return false
  }

  const client = mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILGET_SECRET_KEY
  )

  try {
    const request = await client.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'no-reply@omnivore.app',
          },
          To: [
            {
              Email: email,
              Name: 'Omnivore',
            },
          ],
          Subject: 'Your Omnivore verification link',
          TextPart: `Your Omnivore verification link ${link}`,
        },
      ],
    })
  } catch (err) {
    logger.error('error sending with mailjet', { err })
    return false
  }
  return true
}

export const sendVerificationEmail = async (user: {
  id: string
  name: string
  email: string
}): Promise<boolean> => {
  // generate verification link
  const token = generateVerificationToken({ id: user.id, email: user.email })
  const link = `${env.client.url}/auth/reset-password/${token}`
  // send email
  const dynamicTemplateData = {
    name: user.name,
    link,
  }

  if (process.env.USE_MAILJET) {
    return sendWithMailJet(user.email, link)
  }

  return sendEmail({
    from: env.sender.message,
    to: user.email,
    templateId: env.sendgrid.verificationTemplateId,
    dynamicTemplateData,
  })
}

export const sendPasswordResetEmail = async (user: {
  id: string
  name: string
  email: string
}): Promise<boolean> => {
  // generate link
  const token = generateVerificationToken({ id: user.id })
  const link = `${env.client.url}/auth/reset-password/${token}`
  // send email
  const dynamicTemplateData = {
    name: user.name,
    link,
  }

  if (process.env.USE_MAILJET) {
    return sendWithMailJet(user.email, link)
  }

  return sendEmail({
    from: env.sender.message,
    to: user.email,
    templateId: env.sendgrid.resetPasswordTemplateId,
    dynamicTemplateData,
  })
}
