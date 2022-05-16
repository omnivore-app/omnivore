import { NewsletterHandler } from './newsletter'

export class MorningBrewHandler extends NewsletterHandler {
  constructor() {
    super()
    this.senderRegex = /Morning Brew <crew@morningbrew.com>/
    this.urlRegex = /<a.* href=["']([^"']*)["'].*>View Online<\/a>/
    this.defaultUrl = 'https://www.morningbrew.com'
  }
}
