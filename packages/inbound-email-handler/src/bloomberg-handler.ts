import { NewsletterHandler } from './newsletter'

export class BloombergHandler extends NewsletterHandler {
  constructor() {
    super()
    this.senderRegex = /<.+@mail.bloomberg.*.com>/
    this.urlRegex = /<a class="view-in-browser__url" href=["']([^"']*)["']/
    this.defaultUrl = 'https://www.bloomberg.com'
  }
}
