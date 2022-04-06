import { NewsletterHandler } from './newsletter'
import addressparser from 'addressparser'

export class SubstackHandler extends NewsletterHandler {
  constructor() {
    super()
    this.defaultUrl = 'https://www.substack.com'
  }

  getNewsletterUrl(rawUrl: string, _html: string): string | undefined {
    // raw SubStack newsletter url is like <https://hongbo130.substack.com/p/tldr>
    // we need to get the real url from the raw url
    return addressparser(rawUrl).length > 0
      ? addressparser(rawUrl)[0].name
      : undefined
  }

  isNewsletter(rawUrl: string, _from: string, rawUnSubUrl: string): boolean {
    return !!rawUrl || !!rawUnSubUrl
  }
}
