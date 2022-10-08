import { ContentHandler } from '../content-handler'
import { parseHTML } from 'linkedom'

export class BeehiivHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'beehiiv'
  }

  findNewsletterHeaderHref(dom: Document): string | undefined {
    const readOnline = dom.querySelectorAll('table tr td div a')
    let res: string | undefined = undefined
    readOnline.forEach((e) => {
      if (e.textContent === 'Read Online') {
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
    if (dom.querySelectorAll('img[src*="beehiiv.net"]').length > 0) {
      const beehiivUrl = this.findNewsletterHeaderHref(dom)
      if (beehiivUrl) {
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
