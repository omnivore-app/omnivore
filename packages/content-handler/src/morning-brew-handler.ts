import { ContentHandler } from './content-handler'

export class MorningBrewHandler extends ContentHandler {
  constructor() {
    super()
    this.senderRegex = /Morning Brew <crew@morningbrew.com>/
    this.urlRegex = /<a.* href=["']([^"']*)["'].*>View Online<\/a>/
    this.defaultUrl = 'https://www.morningbrew.com'
    this.name = 'Morning Brew'
  }

  isNewsletter(postHeader: string, from: string, unSubHeader: string): boolean {
    // Axios newsletter is from <xx@axios.com>
    const re = new RegExp(this.senderRegex)
    return re.test(from) && (!!postHeader || !!unSubHeader)
  }
}
