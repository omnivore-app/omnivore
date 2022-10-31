import addressparser from 'addressparser'
import { ContentHandler } from '../content-handler'

export class SubstackHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'substack'
  }

  shouldPreParse(url: string, dom: Document): boolean {
    const host = this.name + '.com'
    const cdnHost = 'substackcdn.com'
    // check if url ends with substack.com
    // or has a profile image hosted at substack.com or substackcdn.com
    return (
      new URL(url).hostname.endsWith(host) ||
      !!dom
        .querySelector('.email-body img')
        ?.getAttribute('src')
        ?.includes(host || cdnHost)
    )
  }

  async preParse(url: string, dom: Document): Promise<Document> {
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

    dom = this.fixupStaticTweets(dom)

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
    dom,
  }: {
    postHeader: string
    from: string
    unSubHeader: string
    dom: Document
  }): Promise<boolean> {
    if (postHeader) {
      return Promise.resolve(true)
    }
    // substack newsletter emails have tables with a *post-meta class
    if (dom.querySelector('table[class$="post-meta"]')) {
      return true
    }
    // If the article has a header link, and substack icons its probably a newsletter
    const href = this.findNewsletterHeaderHref(dom)
    const heartIcon = dom.querySelector('a img[src*="LucideHeart"]')
    const commentsIcon = dom.querySelector('a img[src*="LucideComments"]')
    return Promise.resolve(!!(href && (heartIcon || commentsIcon)))
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

  fixupStaticTweets(dom: Document): Document {
    const preClassName = '_omnivore-static-'
    const staticTweets = Array.from(
      dom.querySelectorAll('div[class="tweet static"]')
    )

    if (staticTweets.length < 1) {
      return dom
    }

    const recurse = (node: Node, f: (node: Node) => void) => {
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i]
        recurse(child, f)
        f(child)
      }
    }

    const isHTMLElement = (node: Node): node is HTMLElement => {
      return node.nodeType == 1
    }

    for (const tweet of Array.from(staticTweets)) {
      tweet.className = preClassName + 'tweet'
      tweet.removeAttribute('style')

      // get all children, rename their class, remove style
      // elements (style will be handled in the reader)
      recurse(tweet, (n: Node) => {
        if (isHTMLElement(n)) {
          const className = n.className
          if (className.startsWith('tweet-')) {
            n.className = preClassName + className
          }
          n.removeAttribute('style')
        }
      })
    }

    return dom
  }
}
