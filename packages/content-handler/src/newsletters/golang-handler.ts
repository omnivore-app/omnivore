import { ContentHandler, PreHandleResult } from '../content-handler'

export class GolangHandler extends ContentHandler {
  constructor() {
    super()
    this.senderRegex = /<.+@golangweekly.com>/
    this.urlRegex = /<a href=["']([^"']*)["'].*>Read on the Web<\/a>/
    this.defaultUrl = 'https://golangweekly.com'
    this.name = 'golangweekly'
  }

  shouldPreHandle(url: string, dom?: Document): boolean {
    const host = this.name + '.com'
    // check if url ends with golangweekly.com
    return new URL(url).hostname.endsWith(host)
  }

  async preHandle(url: string, dom: Document): Promise<PreHandleResult> {
    const body = dom.querySelector('body')

    // this removes the "Subscribe" button
    body?.querySelector('.el-splitbar')?.remove()
    // this removes the title
    body?.querySelector('.el-masthead')?.remove()

    return Promise.resolve({ dom })
  }

  isNewsletter(postHeader: string, from: string, unSubHeader: string): boolean {
    // Axios newsletter is from <xx@axios.com>
    const re = new RegExp(this.senderRegex)
    return re.test(from) && (!!postHeader || !!unSubHeader)
  }
}
