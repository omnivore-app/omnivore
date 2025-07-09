import { ContentHandler, PreHandleResult } from '../content-handler'

export class PdfHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'PDF'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    const path = u.pathname.replace(u.search, '')
    return path.endsWith('.pdf')
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    // Extract a meaningful title from the PDF URL
    const u = new URL(url)
    const pathname = u.pathname
    const filename = pathname.split('/').pop() || 'document'
    const title =
      filename.replace('.pdf', '').replace(/[_-]/g, ' ').trim() ||
      'PDF Document'

    // Provide minimal HTML content for PDFs
    const content = `
      <html>
        <head>
          <title>${title}</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:type" content="article" />
        </head>
        <body>
          <div>
            <h1>${title}</h1>
            <p><a href="${url}" target="_blank">View PDF</a></p>
          </div>
        </body>
      </html>`

    return Promise.resolve({
      contentType: 'application/pdf',
      title,
      content,
    })
  }
}
