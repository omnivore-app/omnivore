import { ContentHandler, PreHandleResult } from '../content-handler'
import axios from 'axios'
import { parseHTML } from 'linkedom'

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

      const response = await axios.get(res.toString())
      const dom = parseHTML(response.data).document
      return {
        title: dom.title,
        content: response.data as string,
        url: res.toString(),
      }
    } catch (error) {
      console.error('error prehandling medium url', error)
      throw error
    }
  }
}
