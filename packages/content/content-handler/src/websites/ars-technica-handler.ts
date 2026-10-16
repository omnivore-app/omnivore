import axios from 'axios'
import { parseHTML } from 'linkedom'
import { ContentHandler, PreHandleResult } from '../content-handler'

/**
 * Some of the content on Ars Technica is split over several pages.
 * If this is the case we should unfurl the entire article into one. l
 */
export class ArsTechnicaHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'ArsTechnica'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    return u.hostname.endsWith('arstechnica.com')
  }

  hasMultiplePages(document: Document): boolean {
    return document.querySelectorAll('nav.page-numbers')?.length != 0
  }

  async grabContentFromUrl(url: string): Promise<Document> {
    const response = await axios.get(url)
    const data = response.data as string
    return parseHTML(data).document
  }

  async extractArticleContentsFromLink(url: string): Promise<Document[]> {
    const dom = await this.grabContentFromUrl(url)
    const articleContent = dom.querySelector('[itemprop="articleBody"]')
    return [].slice.call(articleContent?.childNodes || [])
  }

  async expandLinksAndCombine(document: Document): Promise<Document> {
    const pageNumbers = document.querySelector('nav.page-numbers')
    const articleBody = document.querySelector('[itemprop="articleBody"]')

    if (!pageNumbers || !articleBody) {
      // We shouldn't ever really get here, but sometimes weird things happen.
      return document
    }

    const pageLinkNodes = pageNumbers.querySelectorAll('a')
    // Remove the "Next" Link, as it will duplicate some content.
    const pageLinks =
      Array.from(pageLinkNodes)
        ?.slice(0, pageLinkNodes.length - 1)
        ?.map(({ href }) => href) ?? []

    const pageContents = await Promise.all(
      pageLinks.map(this.extractArticleContentsFromLink.bind(this))
    )

    for (const articleContents of pageContents) {
      // We place all the content in a span to indicate that a page has been parsed.
      const span = document.createElement('SPAN')
      span.className = 'nextPageContents'
      span.append(...articleContents)
      articleBody.append(span)
    }
    pageNumbers.remove()

    return document
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    // We simply retrieve the article without Javascript enabled using a GET command.
    const dom = await this.grabContentFromUrl(url)
    if (!this.hasMultiplePages(dom)) {
      return {
        content: dom.body.outerHTML,
        title: dom.title,
        dom,
      }
    }

    const expandedDom = await this.expandLinksAndCombine(dom)
    return {
      content: expandedDom.body.outerHTML,
      title: dom.title,
      dom: expandedDom,
    }
  }
}
