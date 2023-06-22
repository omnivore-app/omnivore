import axios from 'axios'
import { parseHTML } from 'linkedom'
import { ContentHandler, PreHandleResult } from '../content-handler'

export class TheAtlanticHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'The Atlantic'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    return u.hostname.endsWith('theatlantic.com')
  }

  removeRelatedContentLinks(articleContent: Element): Node[] {
    const content = Array.from(articleContent.children)
    return content.filter(
      (paragraph) => !paragraph.className.startsWith('ArticleRelated')
    )
  }

  unfurlContent(content: Document): Document {
    const articleContentSection = content.querySelector(
      '[data-event-module="article body"]'
    )

    // Remove the audio player.
    content.querySelector('[data-event-module="audio player"]')?.remove()

    if (!articleContentSection) {
      return content
    }

    const articleContent = this.removeRelatedContentLinks(articleContentSection)
    const divOverArticle = content.createElement('div')
    divOverArticle.setAttribute('id', 'prehandled')
    articleContent.forEach((it) => divOverArticle.appendChild(it))

    content.insertBefore(divOverArticle, articleContentSection)
    articleContentSection.remove()

    return content
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    // We simply retrieve the article without Javascript enabled using a GET command.
    const response = await axios.get(url)
    const data = response.data as string
    const dom = parseHTML(data).document
    const editedDom = this.unfurlContent(dom)

    return {
      content: editedDom.body.outerHTML,
      title: dom.title,
      dom: editedDom,
    }
  }
}
