import { ContentHandler } from '../content-handler'

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
    from: string
    dom: Document
    headers: Record<string, string | string[]>
  }): Promise<boolean> {
    const dom = input.dom
    const icons = dom.querySelectorAll(
      'img[src*="convertkit.com"], img[src*="convertkit-mail"]',
    )
    if (icons.length === 0) {
      return Promise.resolve(false)
    }
    // ignore newsletters that have a confirmation link to the newsletter in the body
    const links = dom.querySelectorAll(
      'a[href*="convertkit.com"], a[href*="convertkit-mail"]',
    )
    const isConfirmation = Array.from(links).some((e) => {
      return e.textContent === 'Confirm your subscription'
    })

    return Promise.resolve(!isConfirmation)
  }

  async parseNewsletterUrl(
    headers: Record<string, string | string[]>,
    html: string,
  ): Promise<string | undefined> {
    return this.findNewsletterUrl(html)
  }
}
