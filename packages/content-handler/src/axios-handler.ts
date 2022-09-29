import { ContentHandler } from './content-handler'

export class AxiosHandler extends ContentHandler {
  constructor() {
    super()
    this.senderRegex = /<.+@axios.com>/
    this.urlRegex = /View in browser at <a.*>(.*)<\/a>/
    this.defaultUrl = 'https://axios.com'
    this.name = 'Axios'
  }

  isNewsletter(postHeader: string, from: string, unSubHeader: string): boolean {
    // Axios newsletter is from <xx@axios.com>
    const re = new RegExp(this.senderRegex)
    return re.test(from) && (!!postHeader || !!unSubHeader)
  }
}
