import { ContentHandler } from '../content-handler'

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
    dom: Document
  }): Promise<boolean> {
    const dom = input.dom
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
