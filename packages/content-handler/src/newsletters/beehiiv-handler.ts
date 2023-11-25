import { ContentHandler } from '../content-handler'

export class BeehiivHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'beehiiv'
  }

  async isNewsletter(input: {
    from: string
    headers: Record<string, string | string[]>
  }): Promise<boolean> {
    return Promise.resolve(
      input.headers['x-beehiiv-type']?.toString() === 'newsletter',
    )
  }

  async parseNewsletterUrl(
    headers: Record<string, string | string[]>,
    html: string,
  ): Promise<string | undefined> {
    return Promise.resolve(headers['x-newsletter']?.toString())
  }
}
