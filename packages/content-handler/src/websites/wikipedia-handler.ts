import { ContentHandler } from '../content-handler'

export class WikipediaHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'wikipedia'
  }

  shouldPreParse(url: string, dom: Document): boolean {
    let u = new URL(url)
    return (
      u.hostname.endsWith('wikipedia.org') ||
      u.hostname.endsWith('wiktionary.org')
    )
  }

  async preParse(url: string, dom: Document): Promise<Document> {
    // This removes the [edit] anchors from wikipedia pages
    dom.querySelectorAll('.mw-editsection').forEach((e) => e.remove())

    // Remove footnotes
    dom.querySelectorAll('sup[class="reference"]').forEach((e) => e.remove())

    // this removes the sidebar
    dom.querySelector('.infobox')?.remove()
    return Promise.resolve(dom)
  }
}
