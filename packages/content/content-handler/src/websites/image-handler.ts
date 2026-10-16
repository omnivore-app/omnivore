import { ContentHandler, PreHandleResult } from '../content-handler'

export class ImageHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Image'
  }

  shouldPreHandle(url: string): boolean {
    const IMAGE_URL_PATTERN = /(https?:\/\/.*\.(?:jpg|jpeg|png|webp))/i
    return IMAGE_URL_PATTERN.test(url.toString())
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    const title = url.toString().split('/').pop() || 'Image'
    const content = `
      <html>
        <head>
          <title>${title}</title>
          <meta property="og:image" content="${url}" />
          <meta property="og:title" content="${title}" />
          <meta property="og:type" content="image" />
        </head>
        <body>
          <div>
            <img src="${url}" alt="${title}">
          </div>
        </body>
      </html>`

    return Promise.resolve({ title, content })
  }
}
