import { ContentHandler } from './content-handler'

export class GolangHandler extends ContentHandler {
  constructor() {
    super()
    this.senderRegex = /<.+@golangweekly.com>/
    this.urlRegex = /<a href=["']([^"']*)["'].*>Read on the Web<\/a>/
    this.defaultUrl = 'https://golangweekly.com'
    this.name = 'Golang Weekly'
  }

  isNewsletter(postHeader: string, from: string, unSubHeader: string): boolean {
    // Axios newsletter is from <xx@axios.com>
    const re = new RegExp(this.senderRegex)
    return re.test(from) && (!!postHeader || !!unSubHeader)
  }
}
