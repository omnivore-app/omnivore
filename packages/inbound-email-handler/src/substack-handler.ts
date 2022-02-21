import { NewsletterHandler } from './newsletter'

export class SubstackHandler extends NewsletterHandler {
  getNewsletterUrl(rawUrl: string, _html: string): string | undefined {
    // raw SubStack newsletter url is like <https://hongbo130.substack.com/p/tldr>
    // we need to get the real url
    return rawUrl.slice(1, -1)
  }

  isNewsletter(rawUrl: string, _from: string): boolean {
    return !!rawUrl
  }
}
