import { ContentHandler, PreHandleResult } from '../content-handler'

export class MediumHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Medium'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    return u.hostname.endsWith('medium.com')
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    console.log('prehandling medium url', url)

    try {
      const res = new URL(url)
      res.searchParams.delete('source')
      return Promise.resolve({ url: res.toString() })
    } catch (error) {
      console.error('error prehandling medium url', error)
      throw error
    }
  }
}
