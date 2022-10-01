import addressparser from 'addressparser'
import rfc2047 from 'rfc2047'
import { publishMessage } from './index'

interface Unsubscribe {
  mailTo?: string
  httpUrl?: string
}

const EMAIL_CONFIRMATION_CODE_RECEIVED_TOPIC = 'emailConfirmationCodeReceived'
const CONFIRMATION_EMAIL_SENDER_ADDRESS = 'forwarding-noreply@google.com'
// check unicode parentheses too
const CONFIRMATION_CODE_PATTERN = /^[(（]#\d+[)）]/u
const UNSUBSCRIBE_HTTP_URL_PATTERN = /<(https?:\/\/[^>]*)>/
const UNSUBSCRIBE_MAIL_TO_PATTERN = /<mailto:([^>]*)>/

export const parseUnsubscribe = (unSubHeader: string): Unsubscribe => {
  // parse list-unsubscribe header
  // e.g. List-Unsubscribe: <https://omnivore.com/unsub>, <mailto:unsub@omnivore.com>
  const decoded = rfc2047.decode(unSubHeader)
  return {
    mailTo: decoded.match(UNSUBSCRIBE_MAIL_TO_PATTERN)?.[1],
    httpUrl: decoded.match(UNSUBSCRIBE_HTTP_URL_PATTERN)?.[1],
  }
}

const parseAddress = (address: string): string => {
  const parsed = addressparser(address)
  if (parsed.length > 0) {
    return parsed[0].address
  }
  return ''
}

export const handleConfirmation = async (email: string, subject: string) => {
  console.log('confirmation email', email, subject)

  const confirmationCode = getConfirmationCode(subject)
  if (!email || !confirmationCode) {
    console.log(
      'confirmation email error, user email:',
      email,
      'confirmationCode',
      confirmationCode
    )
    throw new Error('invalid confirmation email')
  }

  const message = { emailAddress: email, confirmationCode: confirmationCode }
  return publishMessage(EMAIL_CONFIRMATION_CODE_RECEIVED_TOPIC, message)
}

export const getConfirmationCode = (subject: string): string | undefined => {
  const matches = subject.match(CONFIRMATION_CODE_PATTERN)
  if (matches) {
    // get the number code only
    // e.g. (#123456) => 123456
    return matches[0].slice(2, -1)
  }
  return undefined
}

export const isConfirmationEmail = (from: string, subject: string): boolean => {
  return (
    parseAddress(from) === CONFIRMATION_EMAIL_SENDER_ADDRESS &&
    CONFIRMATION_CODE_PATTERN.test(subject)
  )
}
