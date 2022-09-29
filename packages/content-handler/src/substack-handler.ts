import addressparser from 'addressparser'
import { ContentHandler } from './content-handler'

export class SubstackHandler extends ContentHandler {
  constructor() {
    super()
    this.defaultUrl = 'https://www.substack.com'
    this.name = 'Substack'
  }

  isNewsletter(postHeader: string, from: string, unSubHeader: string): boolean {
    return !!postHeader
  }

  parseNewsletterUrl(postHeader: string, html: string): string | undefined {
    // raw SubStack newsletter url is like <https://hongbo130.substack.com/p/tldr>
    // we need to get the real url from the raw url
    return addressparser(postHeader).length > 0
      ? addressparser(postHeader)[0].name
      : undefined
  }
}
