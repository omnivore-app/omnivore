import { PubSub } from '@google-cloud/pubsub'
import addressparser from 'addressparser'

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
  protected defaultUrl = 'NEWSLETTER_DEFAULT_URL'

  isNewsletter(_rawUrl: string, from: string): boolean {
    // Axios newsletter is from <xx@axios.com>
    const re = new RegExp(this.senderRegex)
    return re.test(from)
  }

  getNewsletterUrl(_rawUrl: string, html: string): string | undefined {
    // get newsletter url from html
    const matches = html.match(this.urlRegex)
    if (matches) {
      return matches[1]
    }
    return undefined
  }

  getAuthor(from: string): string {
    // get author name from email
    // e.g. 'Jackson Harper from Omnivore App <jacksonh@substack.com>'
    // or 'Mike Allen <mike@axios.com>'
    const parsed = addressparser(from)
    if (parsed.length > 0) {
      return parsed[0].name
    }
    return from
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

    // fallback to default url if newsletter url does not exist
    const url = this.getNewsletterUrl(rawUrl, html) || this.defaultUrl
    const author = this.getAuthor(from)

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
