import addressparser from 'addressparser'
import { ContentHandler, PreHandleResult } from '../content-handler'

export class SubstackHandler extends ContentHandler {
  constructor() {
    super()
    this.defaultUrl = 'https://www.substack.com'
    this.name = 'substack'
  }

  shouldPreHandle(url: string, dom: Document): boolean {
    const host = this.name + '.com'
    // check if url ends with substack.com
    // or has a profile image hosted at substack.com
    return (
      new URL(url).hostname.endsWith(host) ||
      !!dom
        .querySelector('.email-body img')
        ?.getAttribute('src')
        ?.includes(host)
    )
  }

  async preHandle(url: string, dom: Document): Promise<PreHandleResult> {
    const body = dom.querySelector('.email-body-container')

    // this removes header and profile avatar
    body?.querySelector('.header')?.remove()
    body?.querySelector('.preamble')?.remove()
    body?.querySelector('.meta-author-wrap')?.remove()
    // this removes meta button
    body?.querySelector('.post-meta')?.remove()
    // this removes footer
    body?.querySelector('.post-cta')?.remove()
    body?.querySelector('.container-border')?.remove()
    body?.querySelector('.footer')?.remove()

    return Promise.resolve(dom)
  }

  isNewsletter(postHeader: string, from: string, unSubHeader: string): boolean {
    return !!postHeader
  }

  parseNewsletterUrl(postHeader: string, html: string): string | undefined {
    // raw SubStack newsletter url is like <https://hongbo130.substack.com/p/tldr>
    // we need to get the real url from the raw url
    return addressparser(postHeader).length > 0
      ? addressparser(postHeader)[0].name
      : undefined
  }
}
