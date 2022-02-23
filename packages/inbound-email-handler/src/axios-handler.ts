import { NewsletterHandler } from './newsletter'

export class AxiosHandler extends NewsletterHandler {
  constructor() {
    super()
    this.senderRegex = /<.+@axios.com>/
    this.urlRegex = /View in browser at <a.*>(.*)<\/a>/
    this.defaultUrl = 'https://axios.com'
  }
}
