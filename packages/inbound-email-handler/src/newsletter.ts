import { PubSub } from '@google-cloud/pubsub'

const pubsub = new PubSub()
const NEWSLETTER_EMAIL_RECEIVED_TOPIC = 'newsletterEmailReceived'
const EMAIL_CONFIRMATION_CODE_RECEIVED_TOPIC = 'emailConfirmationCodeReceived'
const EMAIL_FORWARDING_SENDER_ADDRESSES = [
  'Gmail Team <forwarding-noreply@google.com>',
]
const NEWSLETTER_SENDER_REGEX = '<.+@substack.com>'
const CONFIRMATION_CODE_PATTERN = '^\\(#\\d+\\)'

export const handleConfirmation = async (email: string, subject: string) => {
  console.log('confirmation email')

  let confirmationCode = ''
  const matches = subject.match(CONFIRMATION_CODE_PATTERN)
  if (matches) {
    // get the number code only
    // e.g. (#123456) => 123456
    confirmationCode = matches[0].slice(2, -1)
  }

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

export const handleNewsletter = async (
  email: string,
  html: string,
  rawUrl: string,
  title: string,
  from: string
) => {
  console.log('handleNewsletter')

  if (!email || !html || !rawUrl || !title || !from) {
    console.log('invalid newsletter email')
    throw new Error('invalid newsletter email')
  }

  // raw newsletter url is like <https://hongbo130.substack.com/p/tldr>
  // we need to get the real url
  const url = rawUrl.slice(1, -1)

  // get author name from email
  // e.g. 'Jackson Harper from Omnivore App'
  const authors = from.split(' from ')
  if (!authors) {
    console.log('invalid from', from)
    throw new Error('invalid from')
  }
  const author = authors[0]

  const message = {
    email: email,
    content: html,
    url: url,
    title: title,
    author: author,
  }
  return publishMessage(NEWSLETTER_EMAIL_RECEIVED_TOPIC, message)
}

const publishMessage = async (
  topic: string,
  message: Record<string, string>
): Promise<[string] | undefined> => {
  return pubsub
    .topic(topic)
    .publishMessage({ json: message })
    .catch((err) => {
      console.log('error publishing message:', err)
      return undefined
    })
}

export const isNewsletter = (from: string, messageId: string): boolean => {
  const re = new RegExp(NEWSLETTER_SENDER_REGEX)
  return re.test(from) || messageId.includes('substack.com')
}

export const isConfirmationEmail = (from: string): boolean => {
  return EMAIL_FORWARDING_SENDER_ADDRESSES.includes(from)
}
