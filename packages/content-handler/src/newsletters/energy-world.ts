import { ContentHandler } from '../content-handler'

export class EnergyWorldHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Energy World'
  }

  async isNewsletter(input: {
    from: string
    html: string
    headers: Record<string, string | string[]>
    dom: Document
  }): Promise<boolean> {
    return Promise.resolve(
      input.from === 'ETEnergyworld Latest News<newsletter@etenergyworld.com>'
    )
  }
}
