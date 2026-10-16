import { ContentHandler, PreHandleResult } from '../content-handler'
import axios from 'axios'
import { parseHTML } from 'linkedom'

export class ScrapingBeeHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'ScrapingBee'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    const hostnames = ['nytimes.com', 'news.google.com', 'fool.ca']

    return hostnames.some((h) => u.hostname.endsWith(h))
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    console.log('prehandling url with scrapingbee', url)

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
      return { title: dom.title, content: response.data as string, url: url }
    } catch (error) {
      console.error('error prehandling url w/scrapingbee', error)
      throw error
    }
  }
}
