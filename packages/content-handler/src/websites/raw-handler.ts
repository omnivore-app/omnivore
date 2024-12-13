import { ContentHandler, PreHandleResult } from '../content-handler'
import axios from 'axios'
import { parseHTML } from 'linkedom'

export class RawContentHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'RawContentHandler'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    const hostnames = [
      'medium.com',
      'fastcompany.com',
      'fortelabs.com',
      'theverge.com',
    ]

    return hostnames.some((h) => u.hostname.endsWith(h))
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    try {
      const response = await axios.get(url)
      const dom = parseHTML(response.data).document
      return { title: dom.title, content: response.data as string, url: url }
    } catch (error) {
      console.error('error prehandling URL', error)
      throw error
    }
  }
}
