import { DOMWindow } from 'jsdom'

export class GolangHandler {
  name = 'golangweekly'

  shouldPrehandle = (url: URL, _dom: DOMWindow): boolean => {
    const host = this.name + '.com'
    // check if url ends with golangweekly.com
    return url.hostname.endsWith(host)
  }

  prehandle = (url: URL, dom: DOMWindow): Promise<DOMWindow> => {
    const body = dom.document.querySelector('body')

    // this removes the "Subscribe" button
    body?.querySelector('.el-splitbar')?.remove()
    // this removes the title
    body?.querySelector('.el-masthead')?.remove()

    return Promise.resolve(dom)
  }
}
