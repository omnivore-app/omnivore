import addressparser from 'addressparser'
import rfc2047 from 'rfc2047'
import { publishMessage } from './index'

interface Unsubscribe {
  mailTo?: string
  httpUrl?: string
}

const GOOGLE_CONFIRMATION_CODE_RECEIVED_TOPIC = 'emailConfirmationCodeReceived'
const GOOGLE_CONFIRMATION_EMAIL_SENDER_ADDRESS = 'forwarding-noreply@google.com'
// check unicode parentheses too
const GOOGLE_CONFIRMATION_CODE_PATTERN = /\d+/u
const UNSUBSCRIBE_HTTP_URL_PATTERN = /<(https?:\/\/[^>]*)>/
const UNSUBSCRIBE_MAIL_TO_PATTERN = /<mailto:([^>]*)>/
const CONFIRMATION_EMAIL_SUBJECT_PATTERN =
  /(confirm|verify).*(newsletter(s)*|subscription(s)*|sign\s*up)/i

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

export const parseAuthor = (address: string): string => {
  const parsed = addressparser(address)
  if (parsed.length > 0) {
    return parsed[0].name
  }
  return address
}

export const handleGoogleConfirmationEmail = async (
  email: string,
  subject: string
) => {
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
  return publishMessage(GOOGLE_CONFIRMATION_CODE_RECEIVED_TOPIC, message)
}

export const getConfirmationCode = (subject: string): string | undefined => {
  const matches = subject.match(GOOGLE_CONFIRMATION_CODE_PATTERN)
  if (matches) {
    // get the number code only
    // e.g. (#123456) => 123456
    return matches[0]
  }
  return undefined
}

export const isGoogleConfirmationEmail = (
  from: string,
  subject: string
): boolean => {
  return (
    parseAddress(from) === GOOGLE_CONFIRMATION_EMAIL_SENDER_ADDRESS &&
    GOOGLE_CONFIRMATION_CODE_PATTERN.test(subject)
  )
}

export const isSubscriptionConfirmationEmail = (subject: string): boolean => {
  return CONFIRMATION_EMAIL_SUBJECT_PATTERN.test(subject)
}
