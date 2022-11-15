import { ContentHandler } from '../content-handler'

export class HeyWorldHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'hey-world'
    this.senderRegex = /<.+@world.hey.com>/
  }

  findNewsletterHeaderHref(dom: Document): string | undefined {
    const readOnline = dom.querySelectorAll('a')
    let res: string | undefined = undefined
    readOnline.forEach((e) => {
      if (e.textContent === 'View this post online') {
        res = e.getAttribute('href') || undefined
      }
    })
    return res
  }

  async parseNewsletterUrl(
    postHeader: string,
    html: string
  ): Promise<string | undefined> {
    return this.findNewsletterUrl(html)
  }
}
