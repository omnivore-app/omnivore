import { generateVerificationToken } from '../utils/auth'
import { env } from '../env'
import { sendEmail } from '../utils/sendEmail'

export const sendConfirmationEmail = async (user: {
  id: string
  name: string
  email: string
}): Promise<boolean> => {
  // generate confirmation link
  const confirmationToken = generateVerificationToken(user.id)
  const confirmationLink = `${env.client.url}/confirm-email/${confirmationToken}`
  // send email
  return sendEmail({
    from: env.sender.message,
    to: user.email,
    subject: 'Confirm your email',
    text: `Hey ${user.name},\n\nPlease confirm your email by clicking the link below:\n\n${confirmationLink}\n\n`,
  })
}

export const sendPasswordResetEmail = async (user: {
  id: string
  name: string
  email: string
}): Promise<boolean> => {
  // generate link
  const token = generateVerificationToken(user.id)
  const link = `${env.client.url}/reset-password/${token}`
  // send email
  return sendEmail({
    from: env.sender.message,
    to: user.email,
    subject: 'Reset your password',
    text: `Hey ${user.name},\n\nPlease reset your password by clicking the link below:\n\n${link}\n\n`,
  })
}
