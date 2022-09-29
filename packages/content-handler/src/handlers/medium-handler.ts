import { ContentHandler, PreHandleResult } from '../index'

class MediumHandler extends ContentHandler {
  shouldPreHandle(url: string, _dom: Document): boolean {
    const u = new URL(url)
    return u.hostname.endsWith('medium.com')
  }

  async preHandle(url: string, _document: Document): Promise<PreHandleResult> {
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
