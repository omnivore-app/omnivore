import { ContentHandler } from '../content-handler'

export class GhostHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'ghost'
  }

  findNewsletterHeaderHref(dom: Document): string | undefined {
    const readOnline = dom.querySelector('.view-online-link')
    return readOnline?.getAttribute('href') || undefined
  }

  async isNewsletter(input: {
    from: string
    dom: Document
    headers: Record<string, string | string[]>
  }): Promise<boolean> {
    const dom = input.dom
    return Promise.resolve(
      dom.querySelectorAll('img[src*="ghost.org"]').length > 0,
    )
  }

  async parseNewsletterUrl(
    headers: Record<string, string | string[]>,
    html: string,
  ): Promise<string | undefined> {
    return this.findNewsletterUrl(html)
  }
}
