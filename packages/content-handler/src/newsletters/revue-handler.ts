import { ContentHandler } from '../content-handler'
import { parseHTML } from 'linkedom'

export class RevueHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'revue'
  }

  findNewsletterHeaderHref(dom: Document): string | undefined {
    const viewOnline = dom.querySelectorAll('table tr td a[target="_blank"]')
    let res: string | undefined = undefined
    viewOnline.forEach((e) => {
      if (e.textContent === 'View online') {
        res = e.getAttribute('href') || undefined
      }
    })
    return res
  }

  async isNewsletter(input: {
    postHeader: string
    from: string
    unSubHeader: string
    html: string
  }): Promise<boolean> {
    const dom = parseHTML(input.html).document
    if (
      dom.querySelectorAll('img[src*="getrevue.co"], img[src*="revue.email"]')
        .length > 0
    ) {
      const getrevueUrl = this.findNewsletterHeaderHref(dom)
      if (getrevueUrl) {
        return Promise.resolve(true)
      }
    }
    return false
  }

  async parseNewsletterUrl(
    postHeader: string,
    html: string
  ): Promise<string | undefined> {
    return this.findNewsletterUrl(html)
  }
}
