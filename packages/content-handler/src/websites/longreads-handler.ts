import axios from 'axios'
import { parseHTML } from 'linkedom'
import { ContentHandler, PreHandleResult } from '../content-handler'

export class LongreadsHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Longreads'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    return u.hostname.endsWith('longreads.com')
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    const response = await axios.get(url)
    const data = response.data as string
    const dom = parseHTML(data).document

    const readFullStoryButton = [...dom.getElementsByClassName('wp-element-button')]
      .find(it => it.innerHTML === 'Read the story')

    if (!readFullStoryButton) {
      return {
        url
      }
    }

    return {
      url: readFullStoryButton.getAttribute('href') || url,
    }
  }
}
