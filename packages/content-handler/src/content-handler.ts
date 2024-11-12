import addressparser from 'addressparser'
import axios from 'axios'
import { parseHTML } from 'linkedom'
import { v4 as uuid } from 'uuid'

interface Unsubscribe {
  mailTo?: string
  httpUrl?: string
}

export interface NewsletterInput {
  from: string
  to: string
  subject: string
  html: string
  headers: Record<string, string | string[]>
}

export interface NewsletterResult {
  email: string
  content: string
  url: string
  title: string
  author: string
  unsubMailTo?: string
  unsubHttpUrl?: string
}

export interface PreHandleResult {
  url?: string
  title?: string
  content?: string
  contentType?: string
  dom?: Document
}

export const FAKE_URL_PREFIX = 'https://omnivore.app/no_url?q='
export const generateUniqueUrl = () => FAKE_URL_PREFIX + uuid()

export abstract class ContentHandler {
  protected senderRegex: RegExp
  protected urlRegex: RegExp
  name: string

  protected constructor() {
    this.senderRegex = new RegExp(/NEWSLETTER_SENDER_REGEX/)
    this.urlRegex = new RegExp(/NEWSLETTER_URL_REGEX/)
    this.name = 'Handler name'
  }

  shouldResolve(url: string): boolean {
    return false
  }

  async resolve(url: string): Promise<string | undefined> {
    return Promise.resolve(url)
  }

  shouldPreHandle(url: string): boolean {
    return false
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    return Promise.resolve({ url })
  }

  shouldPreParse(url: string, dom: Document): boolean {
    return false
  }

  async preParse(url: string, dom: Document): Promise<Document> {
    return Promise.resolve(dom)
  }

  async isNewsletter(input: {
    from: string
    html: string
    headers: Record<string, string | string[]>
    dom: Document
  }): Promise<boolean> {
    const re = new RegExp(this.senderRegex)
    const postHeader = input.headers['list-post']
    const unSubHeader = input.headers['list-unsubscribe']
    return Promise.resolve(
      re.test(input.from) && (!!postHeader || !!unSubHeader)
    )
  }

  findNewsletterHeaderHref(dom: Document): string | undefined {
    return undefined
  }

  // Given an HTML blob tries to find a URL to use for
  // a canonical URL.
  async findNewsletterUrl(html: string): Promise<string | undefined> {
    const dom = parseHTML(html).document

    // Check if this is a substack newsletter
    const href = this.findNewsletterHeaderHref(dom)
    if (href) {
      // Try to make a HEAD request, so we get the redirected URL, since these
      // will usually be behind tracking url redirects
      try {
        const response = await axios.head(href, { timeout: 5000 })
        return Promise.resolve(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          response.request.res.responseUrl as string | undefined
        )
      } catch (e) {
        console.log('error making HEAD request', e)
        return Promise.resolve(href)
      }
    }

    return Promise.resolve(undefined)
  }

  async parseNewsletterUrl(
    headers: Record<string, string | string[]>,
    html: string
  ): Promise<string | undefined> {
    // get url from dom
    const url = await this.findNewsletterUrl(html)
    if (url) {
      return url
    }
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
    if (parsed.length > 0 && parsed[0].name) {
      return parsed[0].name
    }
    return from
  }

  parseUnsubscribe(unSubHeader: string): Unsubscribe {
    // parse list-unsubscribe header
    // e.g. List-Unsubscribe: <https://omnivore.com/unsub>, <mailto:unsub@omnivore.com>
    return {
      httpUrl: unSubHeader.match(/<(https?:\/\/[^>]*)>/)?.[1],
      mailTo: unSubHeader.match(/<mailto:([^>]*)>/)?.[1],
    }
  }

  async handleNewsletter({
    from,
    to,
    subject,
    html,
    headers,
  }: NewsletterInput): Promise<NewsletterResult> {
    if (!from || !html || !subject || !to) {
      console.log('invalid newsletter email')
      throw new Error('invalid newsletter email')
    }

    // fallback to default url if newsletter url does not exist
    // assign a random uuid to the default url to avoid duplicate url
    const url =
      (await this.parseNewsletterUrl(headers, html)) || generateUniqueUrl()
    const author = this.parseAuthor(from)
    const unsubscribe = headers['list-unsubscribe']
      ? this.parseUnsubscribe(headers['list-unsubscribe'].toString())
      : undefined

    return {
      email: to,
      content: html,
      url,
      title: subject,
      author,
      unsubMailTo: unsubscribe?.mailTo || '',
      unsubHttpUrl: unsubscribe?.httpUrl || '',
    }
  }
}
