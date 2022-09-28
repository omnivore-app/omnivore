import addressparser from 'addressparser'
import { v4 as uuidv4 } from 'uuid'
import rfc2047 from 'rfc2047'

interface Unsubscribe {
  mailTo?: string
  httpUrl?: string
}

interface NewsletterMessage {
  email: string
  content: string
  url: string
  title: string
  author: string
  unsubMailTo?: string
  unsubHttpUrl?: string
}

export class ContentHandler {
  protected senderRegex = /NEWSLETTER_SENDER_REGEX/
  protected urlRegex = /NEWSLETTER_URL_REGEX/
  protected defaultUrl = 'NEWSLETTER_DEFAULT_URL'
  protected name = ''

  shouldPrehandle(url: URL, dom: Document): boolean {
    return false
  }

  prehandle(url: URL, document: Document): Promise<Document> {
    return Promise.resolve(document)
  }

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
    const decoded = rfc2047.decode(unSubHeader)
    return {
      mailTo: decoded.match(/<(https?:\/\/[^>]*)>/)?.[1],
      httpUrl: decoded.match(/<mailto:([^>]*)>/)?.[1],
    }
  }

  async handleNewsletter(
    email: string,
    html: string,
    postHeader: string,
    title: string,
    from: string,
    unSubHeader: string
  ): Promise<NewsletterMessage> {
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
    const author = this.parseAuthor(from)
    const unsubscribe = this.parseUnsubscribe(unSubHeader)

    return {
      email,
      content: html,
      url,
      title,
      author,
      unsubMailTo: unsubscribe.mailTo || '',
      unsubHttpUrl: unsubscribe.httpUrl || '',
    }
  }
}
