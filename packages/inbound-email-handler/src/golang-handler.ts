import { NewsletterHandler } from './newsletter'

export class GolangHandler extends NewsletterHandler {
  constructor() {
    super()
    this.senderRegex = /<.+@golangweekly.com>/
    this.urlRegex = /<a href=["']([^"']*)["'].*>Read on the Web<\/a>/
  }
}
