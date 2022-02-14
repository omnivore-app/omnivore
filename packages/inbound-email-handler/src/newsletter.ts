import { PubSub } from '@google-cloud/pubsub'

const pubsub = new PubSub()
const NEWSLETTER_EMAIL_RECEIVED_TOPIC = 'newsletterEmailReceived'
const EMAIL_CONFIRMATION_CODE_RECEIVED_TOPIC = 'emailConfirmationCodeReceived'
const EMAIL_FORWARDING_SENDER_ADDRESSES = [
  'Gmail Team <forwarding-noreply@google.com>',
]
const NEWSLETTER_SENDER_REGEX = '<.+@axios.com>'
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
  console.log('handleNewsletter', email, rawUrl, title, from)

  if (!email || !html || !title || !from) {
    console.log('invalid newsletter email')
    throw new Error('invalid newsletter email')
  }

  // raw SubStack newsletter url is like <https://hongbo130.substack.com/p/tldr>
  // we need to get the real url
  let url = rawUrl
  if (rawUrl.startsWith('<')) {
    url = rawUrl.slice(1, -1)
  }

  // get author name from email
  // e.g. 'Jackson Harper from Omnivore App <jacksonh@substack.com>'
  // or 'Mike Allen <mike@axios.com>'
  const authors = from.includes(' from ')
    ? from.split(' from')
    : from.split(' <')
  if (!authors) {
    console.log('invalid from', from)
    throw new Error('invalid from')
  }
  const author = authors[0]
  console.log('author', author)

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

// SubStack newsletter has raw Url in the email
// url is like <https://hongbo130.substack.com/p/tldr>
// Axios newsletter is from <xx@axios.com>
export const isNewsletter = (rawUrl: string, from: string): boolean => {
  const re = new RegExp(NEWSLETTER_SENDER_REGEX)
  return !!rawUrl || re.test(from)
}

export const isConfirmationEmail = (from: string): boolean => {
  return EMAIL_FORWARDING_SENDER_ADDRESSES.includes(from)
}
