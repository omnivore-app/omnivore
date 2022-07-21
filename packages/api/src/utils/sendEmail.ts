import { MailService } from '@sendgrid/mail'
import { MailDataRequired } from '@sendgrid/helpers/classes/mail'

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
    throw new Error('Sendgrid API key not set')
  }

  client.setApiKey(process.env.SENDGRID_MSGS_API_KEY)

  console.log('sending email', msg)

  try {
    const response = await client.send(msg)
    console.log('email sent', response)

    return true
  } catch (error) {
    console.log('error sending email', error)
    const err = asSendGridError(error)
    if (err) {
      console.log('sendgrid error:', JSON.stringify(err.response?.body))
    }

    return false
  }
}
