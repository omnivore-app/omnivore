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
  const token = await generateVerificationToken({ id: user.id })
  const link = `${env.client.url}/auth/confirm-email/${token}`
  // send email
  const dynamicTemplateData = {
    link,
  }

  const result = await enqueueSendEmail({
    userId: user.id,
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
  const token = await generateVerificationToken({
    id: user.id,
    email: user.email,
  })
  const link = `${env.client.url}/auth/reset-password/${token}`
  // send email
  const dynamicTemplateData = {
    link,
  }

  const result = await enqueueSendEmail({
    userId: user.id,
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
  const token = await generateVerificationToken({ id: user.id })
  const link = `${env.client.url}/auth/reset-password/${token}`
  // send email
  const dynamicTemplateData = {
    link,
  }

  const result = await enqueueSendEmail({
    userId: user.id,
    to: user.email,
    dynamicTemplateData: dynamicTemplateData,
    templateId: env.sendgrid.resetPasswordTemplateId,
  })

  return !!result
}

export const sendExportJobEmail = async (
  userId: string,
  state: 'completed' | 'failed' | 'started',
  urlToDownload?: string
) => {
  let subject = ''
  let html = ''

  switch (state) {
    case 'completed':
      if (!urlToDownload) {
        throw new Error('urlToDownload is required')
      }

      subject = 'Your Omnivore export is ready'
      html = `<p>Your export is ready. You can download it from the following link: <a href="${urlToDownload}">${urlToDownload}</a></p>`
      break
    case 'failed':
      subject = 'Your Omnivore export failed'
      html = '<p>Your export failed. Please try again later.</p>'
      break
    case 'started':
      subject = 'Your Omnivore export has started'
      html =
        '<p>Your export has started. You will receive an email once it is completed.</p>'
      break
    default:
      throw new Error('Invalid state')
  }

  logger.info('enqueing email job:', {
    userId,
    subject,
    html,
  })

  return enqueueSendEmail({
    userId,
    subject,
    html,
  })
}
