import addressparser from 'addressparser'
import { ContentHandler, PreHandleResult } from '../content-handler'
import { parseHTML } from 'linkedom'

export class SubstackHandler extends ContentHandler {
  constructor() {
    super()
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

  findNewsletterHeaderHref(dom: Document): string | undefined {
    // Substack header links
    const postLink = dom.querySelector('h1 a')
    if (postLink) {
      return postLink.getAttribute('href') || undefined
    }

    return undefined
  }

  async isNewsletter({
    postHeader,
    html,
  }: {
    postHeader: string
    from: string
    unSubHeader: string
    html: string
  }): Promise<boolean> {
    if (postHeader) {
      return Promise.resolve(true)
    }
    const dom = parseHTML(html).document
    // substack newsletter emails have tables with a *post-meta class
    if (dom.querySelector('table[class$="post-meta"]')) {
      return true
    }
    // If the article has a header link, and substack icons its probably a newsletter
    const href = this.findNewsletterHeaderHref(dom)
    const heartIcon = dom.querySelector(
      'table tbody td span a img[src*="HeartIcon"]'
    )
    const recommendIcon = dom.querySelector(
      'table tbody td span a img[src*="RecommendIconRounded"]'
    )
    return Promise.resolve(!!(href && (heartIcon || recommendIcon)))
  }

  async parseNewsletterUrl(
    postHeader: string,
    html: string
  ): Promise<string | undefined> {
    // raw SubStack newsletter url is like <https://hongbo130.substack.com/p/tldr>
    // we need to get the real url from the raw url
    if (postHeader && addressparser(postHeader).length > 0) {
      return Promise.resolve(addressparser(postHeader)[0].name)
    }
    return this.findNewsletterUrl(html)
  }
}
