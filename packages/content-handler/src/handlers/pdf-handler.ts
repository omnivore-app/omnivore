import { ContentHandler, PreHandleResult } from '../index'

class PdfHandler extends ContentHandler {
  shouldPreHandle(url: string, _dom: Document): boolean {
    const u = new URL(url)
    const path = u.pathname.replace(u.search, '')
    return path.endsWith('.pdf')
  }

  async preHandle(_url: string, _document: Document): Promise<PreHandleResult> {
    return Promise.resolve({ contentType: 'application/pdf' })
  }
}
