import addressparser from 'addressparser'
import rfc2047 from 'rfc2047'
import { v4 as uuid } from 'uuid'
import { parseHTML } from 'linkedom'
import axios from 'axios'

interface Unsubscribe {
  mailTo?: string
  httpUrl?: string
}

export interface NewsletterInput {
  postHeader: string
  from: string
  unSubHeader: string
  email: string
  html: string
  title: string
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
    postHeader: string
    from: string
    unSubHeader: string
    html?: string
  }): Promise<boolean> {
    const re = new RegExp(this.senderRegex)
    return Promise.resolve(
      re.test(input.from) && (!!input.postHeader || !!input.unSubHeader)
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
    _postHeader: string,
    html: string
  ): Promise<string | undefined> {
    // get newsletter url from html
    const matches = html.match(this.urlRegex)
    if (matches) {
      return Promise.resolve(matches[1])
    }
    return Promise.resolve(undefined)
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

  async handleNewsletter({
    email,
    html,
    postHeader,
    title,
    from,
    unSubHeader,
  }: NewsletterInput): Promise<NewsletterResult> {
    console.log('handleNewsletter', email, postHeader, title, from)

    if (!email || !html || !title || !from) {
      console.log('invalid newsletter email')
      throw new Error('invalid newsletter email')
    }

    // fallback to default url if newsletter url does not exist
    // assign a random uuid to the default url to avoid duplicate url
    const url =
      (await this.parseNewsletterUrl(postHeader, html)) || generateUniqueUrl()
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
