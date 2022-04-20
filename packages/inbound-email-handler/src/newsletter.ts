import { PubSub } from '@google-cloud/pubsub'
import { v4 as uuidv4 } from 'uuid'
import addressparser from 'addressparser'

const pubsub = new PubSub()
const NEWSLETTER_EMAIL_RECEIVED_TOPIC = 'newsletterEmailReceived'
const EMAIL_CONFIRMATION_CODE_RECEIVED_TOPIC = 'emailConfirmationCodeReceived'
const EMAIL_FORWARDING_SENDER_ADDRESSES = [
  'Gmail Team <forwarding-noreply@google.com>',
]
const CONFIRMATION_CODE_PATTERN = /^\(#\d+\)/
const UNSUBSCRIBE_HTTP_URL_PATTERN = /<(https?:\/\/[^>]*)>/
const UNSUBSCRIBE_MAIL_TO_PATTERN = /<mailto:([^>]*)>/

interface Unsubscribe {
  mailTo?: string
  httpUrl?: string
}

export class NewsletterHandler {
  protected senderRegex = /NEWSLETTER_SENDER_REGEX/
  protected urlRegex = /NEWSLETTER_URL_REGEX/
  protected defaultUrl = 'NEWSLETTER_DEFAULT_URL'

  isNewsletter(postHeader: string, from: string, unSubHeader: string): boolean {
    // Axios newsletter is from <xx@axios.com>
    const re = new RegExp(this.senderRegex)
    return re.test(from) && (!!postHeader || !!unSubHeader)
  }

  parseNewsletterUrl(_postHeader: string, html: string): string | undefined {
    // get newsletter url from html
    const matches = html.match(this.urlRegex)
    if (matches) {
      return matches[1]
    }
    return undefined
  }

  parseAuthor(from: string): string {
    // get author name from email
    // e.g. 'Jackson Harper from Omnivore App <jacksonh@substack.com>'
    // or 'Mike Allen <mike@axios.com>'
    const parsed = addressparser(from)
    if (parsed.length > 0) {
      return parsed[0].name
    }
    return from
  }

  parseUnsubscribe(unSubHeader: string): Unsubscribe {
    // parse list-unsubscribe header
    // e.g. List-Unsubscribe: <https://omnivore.com/unsub>, <mailto:unsub@omnivore.com>
    return {
      mailTo: unSubHeader.match(UNSUBSCRIBE_MAIL_TO_PATTERN)?.[1],
      httpUrl: unSubHeader.match(UNSUBSCRIBE_HTTP_URL_PATTERN)?.[1],
    }
  }

  async handleNewsletter(
    email: string,
    html: string,
    postHeader: string,
    title: string,
    from: string,
    unSubHeader: string
  ): Promise<string | undefined> {
    console.log('handleNewsletter', email, postHeader, title, from)

    if (!email || !html || !title || !from) {
      console.log('invalid newsletter email')
      throw new Error('invalid newsletter email')
    }

    // fallback to default url if newsletter url does not exist
    // assign a random uuid to the default url to avoid duplicate url
    const url =
      this.parseNewsletterUrl(postHeader, html) ||
      `${this.defaultUrl}?source=newsletters&id=${uuidv4()}`
    const author = this.parseAuthor(from) || 'Unknown'
    const unsubscribe = this.parseUnsubscribe(unSubHeader)
    const message = {
      email,
      content: html,
      url,
      title,
      author,
      unsubMailTo: unsubscribe.mailTo || '',
      unsubHttpUrl: unsubscribe.httpUrl || '',
    }

    return publishMessage(NEWSLETTER_EMAIL_RECEIVED_TOPIC, message)
  }
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

export const isConfirmationEmail = (from: string): boolean => {
  return EMAIL_FORWARDING_SENDER_ADDRESSES.includes(from)
}

const publishMessage = async (
  topic: string,
  message: Record<string, string>
): Promise<string | undefined> => {
  return pubsub
    .topic(topic)
    .publishMessage({ json: message })
    .catch((err) => {
      console.log('error publishing message:', err)
      return undefined
    })
}
