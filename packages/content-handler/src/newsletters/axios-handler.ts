import { ContentHandler } from '../content-handler'

export class AxiosHandler extends ContentHandler {
  constructor() {
    super()
    this.senderRegex = /<.+@axios.com>/
    this.urlRegex = /View in browser at <a.*>(.*)<\/a>/
    this.name = 'axios'
  }

  shouldPreParse(url: string, dom: Document): boolean {
    const host = this.name + '.com'
    // check if url ends with axios.com
    return new URL(url).hostname.endsWith(host)
  }

  async preParse(url: string, dom: Document): Promise<Document> {
    const body = dom.querySelector('table')

    let isFooter = false
    // this removes ads and replaces table with a div
    body?.querySelectorAll('table').forEach((el) => {
      // remove the footer and the ads
      if (!el.textContent || el.textContent.length < 20 || isFooter) {
        el.remove()
      } else {
        // removes the first few rows of the table (the header)
        // remove the last two rows of the table (they are ads)
        el.querySelectorAll('tr').forEach((tr, i) => {
          if (i <= 7 || i >= el.querySelectorAll('tr').length - 2) {
            console.log('removing', tr)
            tr.remove()
          }
        })
        // replace the table with a div
        const div = dom.createElement('div')
        div.innerHTML = el.innerHTML
        el.parentNode?.replaceChild(div, el)
        // set the isFooter flag to true because the next table is the footer
        isFooter = true
      }
    })

    return Promise.resolve(dom)
  }
}
