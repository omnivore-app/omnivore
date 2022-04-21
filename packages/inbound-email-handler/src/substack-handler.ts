import { NewsletterHandler } from './newsletter'
import addressparser from 'addressparser'

export class SubstackHandler extends NewsletterHandler {
  constructor() {
    super()
    this.defaultUrl = 'https://www.substack.com'
  }

  parseNewsletterUrl(postHeader: string, _html: string): string | undefined {
    // raw SubStack newsletter url is like <https://hongbo130.substack.com/p/tldr>
    // we need to get the real url from the raw url
    return addressparser(postHeader).length > 0
      ? addressparser(postHeader)[0].name
      : undefined
  }

  isNewsletter(
    postHeader: string,
    _from: string,
    _unSubHeader: string
  ): boolean {
    return !!postHeader
  }
}
