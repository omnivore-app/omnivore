import { PubSub } from '@google-cloud/pubsub'

const pubsub = new PubSub()
const NEWSLETTER_EMAIL_RECEIVED_TOPIC = 'newsletterEmailReceived'
const EMAIL_CONFIRMATION_CODE_RECEIVED_TOPIC = 'emailConfirmationCodeReceived'
const EMAIL_FORWARDING_SENDER_ADDRESSES = [
  'Gmail Team <forwarding-noreply@google.com>',
]
const CONFIRMATION_CODE_PATTERN = /^\\(#\\d+\\)/

export class NewsletterHandler {
  protected senderRegex = /NEWSLETTER_SENDER_REGEX/
  protected urlRegex = /NEWSLETTER_URL_REGEX/

  isNewsletter(_rawUrl: string, from: string): boolean {
    // Axios newsletter is from <xx@axios.com>
    const re = new RegExp(this.senderRegex)
    return re.test(from)
  }

  getNewsletterUrl(rawUrl: string, html: string): string | undefined {
    // get newsletter url from html
    const matches = html.match(this.urlRegex)
    if (matches) {
      return matches[1]
    }
    return undefined
  }

  async handleNewsletter(
    email: string,
    html: string,
    rawUrl: string,
    title: string,
    from: string
  ): Promise<[string] | undefined> {
    console.log('handleNewsletter', email, rawUrl, title, from)

    if (!email || !html || !title || !from) {
      console.log('invalid newsletter email')
      throw new Error('invalid newsletter email')
    }

    const url = this.getNewsletterUrl(rawUrl, html)
    console.log('url', url)
    if (!url) {
      console.log('invalid newsletter url', url)
      throw new Error('invalid newsletter url')
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

    const message = {
      email: email,
      content: html,
      url: url,
      title: title,
      author: author,
    }
    return publishMessage(NEWSLETTER_EMAIL_RECEIVED_TOPIC, message)
  }
}

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

export const isConfirmationEmail = (from: string): boolean => {
  return EMAIL_FORWARDING_SENDER_ADDRESSES.includes(from)
}
