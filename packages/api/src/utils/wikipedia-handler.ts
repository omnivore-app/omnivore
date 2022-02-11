import { DOMWindow } from 'jsdom'

export class WikipediaHandler {
  name = 'wikipedia'

  shouldPrehandle = (url: URL, _dom: DOMWindow): boolean => {
    return url.hostname.endsWith('wikipedia.org')
  }

  prehandle = (url: URL, dom: DOMWindow): Promise<DOMWindow> => {
    // This removes the [edit] anchors from wikipedia pages
    dom.document.querySelectorAll('.mw-editsection').forEach((e) => e.remove())
    // this removes the sidebar
    dom.document.querySelector('.infobox')?.remove()
    return Promise.resolve(dom)
  }
}
