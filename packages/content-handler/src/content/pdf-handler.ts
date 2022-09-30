import { ContentHandler, PreHandleResult } from '../content-handler'

export class PdfHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'PDF'
  }

  shouldPreHandle(url: string, dom?: Document): boolean {
    const u = new URL(url)
    const path = u.pathname.replace(u.search, '')
    return path.endsWith('.pdf')
  }

  async preHandle(_url: string, document?: Document): Promise<PreHandleResult> {
    return Promise.resolve({ contentType: 'application/pdf' })
  }
}
