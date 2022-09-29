import { ContentHandler, PreHandleResult } from '../index'
import axios from 'axios'
import { parseHTML } from 'linkedom'

class DerstandardHandler extends ContentHandler {
  shouldPreHandle(url: string, _dom: Document): boolean {
    const u = new URL(url)
    return u.hostname === 'www.derstandard.at'
  }

  async preHandle(url: string, _document: Document): Promise<PreHandleResult> {
    const response = await axios.get(url, {
      // set cookie to give consent to get the article
      headers: {
        cookie: `DSGVO_ZUSAGE_V1=true; consentUUID=2bacb9c1-1e80-4be0-9f7b-ee987cf4e7b0_6`,
      },
    })
    const content = response.data

    const dom = parseHTML(content).document
    const titleElement = dom.querySelector('.article-title')
    titleElement && titleElement.remove()

    return {
      content: dom.body.outerHTML,
      title: titleElement?.textContent || undefined,
    }
  }
}
