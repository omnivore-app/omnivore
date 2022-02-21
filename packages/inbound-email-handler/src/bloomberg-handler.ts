import { NewsletterHandler } from './newsletter'

export class BloombergHandler extends NewsletterHandler {
  constructor() {
    super()
    this.senderRegex = /<.+@mail.bloombergbusiness.com>/
    this.urlRegex = /<a class="view-in-browser__url" href=["']([^"']*)["']/
  }
}
