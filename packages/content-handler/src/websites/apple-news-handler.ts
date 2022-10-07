import axios from 'axios'
import { parseHTML } from 'linkedom'
import { ContentHandler, PreHandleResult } from '../content-handler'

export class AppleNewsHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Apple News'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    return u.hostname === 'apple.news'
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    const MOBILE_USER_AGENT =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
    const response = await axios.get(url, {
      headers: { 'User-Agent': MOBILE_USER_AGENT },
    })
    const data = response.data as string
    const dom = parseHTML(data).document
    // make sure it's a valid URL by wrapping in new URL
    const href = dom
      .querySelector('span.click-here')
      ?.parentElement?.getAttribute('href')
    const u = href ? new URL(href) : undefined
    return { url: u?.href }
  }
}
