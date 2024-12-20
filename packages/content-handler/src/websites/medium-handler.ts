import { ContentHandler, PreHandleResult } from '../content-handler'
import axios from 'axios'
import { parseHTML } from 'linkedom'

export class MediumHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Medium'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    return u.hostname.endsWith('medium.com')
  }

  addImages(document: Document): Document {
    const pictures = document.querySelectorAll('picture')

    pictures.forEach((pict) => {
      const source = pict.querySelector('source')
      if (source) {
        const srcSet = source.getAttribute('srcSet')

        const sources = (srcSet || '')
          .split(', ')
          .map((src) => src.split(' '))
          .sort((a, b) =>
            Number(a[1].replace('w', '')) > Number(b[1].replace('w', ''))
              ? -1
              : 1
          )

        // This should be the largest image in the source set.
        if (sources && sources.length && Array.isArray(sources[0])) {
          const url = sources[0][0]
          const img = document.createElement('img')
          img.src = url
          pict.after(img)
          pict.remove()
        }
      }
    })

    return document
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    console.log('prehandling medium url', url)

    try {
      const res = new URL(url)
      res.searchParams.delete('source')

      const response = await axios.get(res.toString())
      const dom = parseHTML(response.data).document
      const imageAddedDom = this.addImages(dom)
      return {
        title: dom.title,
        content: imageAddedDom.body.outerHTML,
        url: res.toString(),
      }
    } catch (error) {
      console.error('error prehandling medium url', error)
      throw error
    }
  }
}
