import axios from 'axios'
import { parseHTML } from 'linkedom'
import { ContentHandler, PreHandleResult } from '../content-handler'

export class WiredHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Wired'
  }

  // We check if this is a paywalled document, as paywalled documents will have <p> tags
  // in the body.
  isPaywalledContent(document: Document): boolean {
    return document.getElementsByClassName('paywall').length > 0
  }

  removeNonArticleNodes(document: Document): Document {
    const genericCallouts = Array.from(
      document.querySelectorAll('[data-testid="GenericCallout"]')
    )
    const ads = Array.from(document.querySelectorAll('.ad__slot')).map(
      (it) => it.parentElement
    )
    const mostPopularArticles = Array.from(
      document.querySelectorAll('[data-most-popular-id]')
    )

    ;[...genericCallouts, ...ads, ...mostPopularArticles].forEach((it) =>
      it?.remove()
    )

    return document
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    return u.hostname.endsWith('wired.com')
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    const response = await axios.get(url)
    const data = response.data as string
    const dom = parseHTML(data).document

    if (!this.isPaywalledContent(dom)) {
      // This is just to ensure that the currently working articles don't break.
      // Looking further into this, they might all have paywalls?
      return {}
    }

    const cleanedArticleDom = this.removeNonArticleNodes(dom)

    return {
      content: cleanedArticleDom.body.outerHTML,
      title: dom.title,
      dom: cleanedArticleDom,
    }
  }
}
