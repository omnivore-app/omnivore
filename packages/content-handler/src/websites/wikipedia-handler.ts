import { ContentHandler, PreHandleResult } from '../content-handler'

export class WikipediaHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'wikipedia'
  }

  shouldPreHandle(url: string, dom?: Document): boolean {
    return new URL(url).hostname.endsWith('wikipedia.org')
  }

  async preHandle(url: string, dom: Document): Promise<PreHandleResult> {
    // This removes the [edit] anchors from wikipedia pages
    dom.querySelectorAll('.mw-editsection').forEach((e) => e.remove())
    // this removes the sidebar
    dom.querySelector('.infobox')?.remove()
    return Promise.resolve({ dom })
  }
}
