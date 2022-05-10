export class WikipediaHandler {
  name = 'wikipedia'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldPrehandle = (url: URL, _dom: Document): boolean => {
    return url.hostname.endsWith('wikipedia.org')
  }

  prehandle = (url: URL, dom: Document): Promise<Document> => {
    // This removes the [edit] anchors from wikipedia pages
    dom.querySelectorAll('.mw-editsection').forEach((e) => e.remove())
    // this removes the sidebar
    dom.querySelector('.infobox')?.remove()
    return Promise.resolve(dom)
  }
}
