export class BloombergHandler {
  name = 'bloomberg'

  shouldPrehandle = (url: URL, dom: Document): boolean => {
    const host = this.name + '.com'
    // check if url ends with bloomberg.com
    return (
      url.hostname.endsWith(host) ||
      dom.querySelector('.logo-image')?.getAttribute('alt')?.toLowerCase() ===
        this.name
    )
  }

  prehandle = (_url: URL, dom: Document): Promise<Document> => {
    const body = dom.querySelector('.wrapper')

    // this removes header
    body?.querySelector('.sailthru-variables')?.remove()
    body?.querySelector('.preview-text')?.remove()
    body?.querySelector('.logo-wrapper')?.remove()
    body?.querySelector('.by-the-number-wrapper')?.remove()
    // this removes footer
    body?.querySelector('.quote-box-wrapper')?.remove()
    body?.querySelector('.header-wrapper')?.remove()
    body?.querySelector('.component-wrapper')?.remove()
    body?.querySelector('.footer')?.remove()

    return Promise.resolve(dom)
  }
}
