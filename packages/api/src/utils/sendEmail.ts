import { MailDataRequired } from '@sendgrid/helpers/classes/mail'
import { MailService } from '@sendgrid/mail'
import { env } from '../env'
import { logger } from './logger'

type SendGridResponse = {
  body?: string
}

interface SendGridError {
  response?: SendGridResponse
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asSendGridError = (error: any): SendGridError | undefined => {
  if ('response' in error) {
    const serr = error as SendGridError
    if ('body' in serr) {
      return serr
    }
  }
  return undefined
}

export const sendEmail = async (msg: MailDataRequired): Promise<boolean> => {
  const client = new MailService()
  if (!process.env.SENDGRID_MSGS_API_KEY) {
    if (env.dev.isLocal) {
      logger.info('SendGrid API key not set.\nSending email:', msg)
      return true
    }

    throw 'SendGrid API key not set'
  }

  client.setApiKey(process.env.SENDGRID_MSGS_API_KEY)

  logger.info('sending email', msg)

  try {
    const response = await client.send(msg)
    logger.info('email sent', response)

    return true
  } catch (error) {
    const err = asSendGridError(error)
    if (err) {
      logger.error('sendgrid error:', err.response?.body)
    } else {
      logger.error('error sending email', error)
    }

    return false
  }
}
