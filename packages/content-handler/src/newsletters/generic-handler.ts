import { ContentHandler } from '../content-handler'
import addressparser from 'addressparser'

export class GenericHandler extends ContentHandler {
  // newsletter url text regex for newsletters that don't have a newsletter header
  NEWSLETTER_URL_TEXT_REGEX =
    /((View|Read)(.*)(email|post)?(.*)(in your browser|online|on (FS|the Web))|Lire en ligne)/i

  constructor() {
    super()
    this.name = 'Generic Newsletter'
  }

  async isNewsletter(input: {
    from: string
    html: string
    headers: Record<string, string | string[]>
    dom: Document
  }): Promise<boolean> {
    const postHeader = input.headers['list-post'] || input.headers['list-id']
    const unSubHeader = input.headers['list-unsubscribe']
    return Promise.resolve(!!postHeader || !!unSubHeader)
  }

  findNewsletterHeaderHref(dom: Document): string | undefined {
    const readOnline = dom.querySelectorAll('a')
    let res: string | undefined = undefined
    readOnline.forEach((e) => {
      if (e.textContent && this.NEWSLETTER_URL_TEXT_REGEX.test(e.textContent)) {
        res = e.getAttribute('href') || undefined
      }
    })
    return res
  }

  async parseNewsletterUrl(
    headers: Record<string, string | string[]>,
    html: string
  ): Promise<string | undefined> {
    // raw SubStack newsletter url is like <https://hongbo130.substack.com/p/tldr>
    // we need to get the real url from the raw url
    const postHeader = headers['list-post']?.toString()
    if (postHeader && addressparser(postHeader).length > 0) {
      return addressparser(postHeader)[0].name
    }

    return this.findNewsletterUrl(html)
  }
}
