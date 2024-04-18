import mailjet from 'node-mailjet'
import { env } from '../env'
import { generateVerificationToken } from '../utils/auth'
import { enqueueSendEmail } from '../utils/createTask'
import { logger } from '../utils/logger'

export const sendNewAccountVerificationEmail = async (user: {
  id: string
  name: string
  email: string
}): Promise<boolean> => {
  // generate confirmation link
  const token = generateVerificationToken({ id: user.id })
  const link = `${env.client.url}/auth/confirm-email/${token}`
  // send email
  const dynamicTemplateData = {
    link,
  }

  const result = await enqueueSendEmail({
    to: user.email,
    dynamicTemplateData: dynamicTemplateData,
    templateId: env.sendgrid.confirmationTemplateId,
  })

  return !!result
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

export const sendAccountChangeEmail = async (user: {
  id: string
  name: string
  email: string
}): Promise<boolean> => {
  // generate verification link
  const token = generateVerificationToken({ id: user.id, email: user.email })
  const link = `${env.client.url}/auth/reset-password/${token}`
  // send email
  const dynamicTemplateData = {
    link,
  }

  const result = await enqueueSendEmail({
    to: user.email,
    dynamicTemplateData: dynamicTemplateData,
    templateId: env.sendgrid.verificationTemplateId,
  })

  return !!result
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
    link,
  }

  const result = await enqueueSendEmail({
    to: user.email,
    dynamicTemplateData: dynamicTemplateData,
    templateId: env.sendgrid.resetPasswordTemplateId,
  })

  return !!result
}
