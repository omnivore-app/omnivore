import { ContentHandler } from '../content-handler'

export class IndiaTimesHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'India Times'
  }

  async isNewsletter(input: {
    from: string
    html: string
    headers: Record<string, string | string[]>
    dom: Document
  }): Promise<boolean> {
    return Promise.resolve(
      input.from === 'The Times of India <newsletters@timesofindia.com>'
    )
  }

  findNewsletterHeaderHref(dom: Document): string | undefined {
    const readOnline = dom.querySelectorAll('a')
    let res: string | undefined = undefined
    readOnline.forEach((e) => {
      if (e.textContent === 'view in browser') {
        res = e.getAttribute('href') || undefined
      }
    })
    return res
  }
}
