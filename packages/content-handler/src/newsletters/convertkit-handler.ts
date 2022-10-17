import { ContentHandler } from '../content-handler'
import { parseHTML } from 'linkedom'

export class ConvertkitHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'convertkit'
  }

  findNewsletterHeaderHref(dom: Document): string | undefined {
    const readOnline = dom.querySelectorAll('a')
    let res: string | undefined = undefined
    readOnline.forEach((e) => {
      if (
        e.textContent === 'View this email in your browser' ||
        e.textContent === 'Read on FS'
      ) {
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
    return Promise.resolve(
      dom.querySelectorAll(
        'img[src*="convertkit.com"], img[src*="convertkit-mail"]'
      ).length > 0
    )
  }

  async parseNewsletterUrl(
    postHeader: string,
    html: string
  ): Promise<string | undefined> {
    return this.findNewsletterUrl(html)
  }
}
