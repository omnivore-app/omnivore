import { DOMWindow } from 'jsdom'

export class SubstackHandler {
  name = 'bloomberg'

  shouldPrehandle = (url: URL, dom: DOMWindow): boolean => {
    const host = this.name + '.com'
    // check if url ends with bloomberg.com
    return url.hostname.endsWith(host)
  }

  prehandle = (url: URL, dom: DOMWindow): Promise<DOMWindow> => {
    const body = dom.document.querySelector('.wrapper')

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
