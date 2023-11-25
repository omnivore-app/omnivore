import { ContentHandler } from '../content-handler'

export class CooperPressHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'cooper-press'
  }

  findNewsletterHeaderHref(dom: Document): string | undefined {
    const readOnline = dom.querySelectorAll('a')
    let res: string | undefined = undefined
    readOnline.forEach((e) => {
      if (e.textContent === 'Read on the Web') {
        res = e.getAttribute('href') || undefined
      }
    })
    return res
  }

  async isNewsletter(input: {
    from: string
    dom: Document
    headers: Record<string, string | string[]>
  }): Promise<boolean> {
    const dom = input.dom
    return Promise.resolve(
      dom.querySelectorAll('a[href*="cooperpress.com"]').length > 0,
    )
  }

  async parseNewsletterUrl(
    headers: Record<string, string | string[]>,
    html: string,
  ): Promise<string | undefined> {
    return this.findNewsletterUrl(html)
  }
}
