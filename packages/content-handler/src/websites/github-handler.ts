import { ContentHandler } from '../content-handler'

export class GitHubHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'github'
  }

  shouldPreParse(url: string, dom: Document): boolean {
    return new URL(url).hostname.endsWith('github.com')
  }

  async preParse(url: string, dom: Document): Promise<Document> {
    const body = dom.querySelector('body')
    const article = dom.querySelector('article')

    if (body && article) {
      body?.replaceChildren(article)
    }

    return Promise.resolve(dom)
  }
}
