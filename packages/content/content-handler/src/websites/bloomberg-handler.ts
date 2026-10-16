import axios from 'axios'
import { parseHTML } from 'linkedom'
import { ContentHandler, PreHandleResult } from '../content-handler'

export class BloombergHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Bloomberg'
  }

  shouldPreHandle(url: string): boolean {
    const BLOOMBERG_URL_MATCH =
      /https?:\/\/(www\.)?bloomberg.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/
    return BLOOMBERG_URL_MATCH.test(url.toString())
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    console.log('prehandling bloomberg url', url)

    try {
      const response = await axios.get('https://app.scrapingbee.com/api/v1', {
        params: {
          api_key: process.env.SCRAPINGBEE_API_KEY,
          url: url,
          return_page_source: true,
          block_ads: true,
          block_resources: false,
        },
      })
      const dom = parseHTML(response.data).document
      return {
        title: dom.title,
        content: dom.querySelector('body')?.innerHTML,
        url: url,
      }
    } catch (error) {
      console.error('error prehandling bloomberg url', error)
      throw error
    }
  }
}
