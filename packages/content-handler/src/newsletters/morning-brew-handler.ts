import { ContentHandler, PreHandleResult } from '../content-handler'

export class MorningBrewHandler extends ContentHandler {
  constructor() {
    super()
    this.senderRegex = /Morning Brew <crew@morningbrew.com>/
    this.urlRegex = /<a.* href=["']([^"']*)["'].*>View Online<\/a>/
    this.defaultUrl = 'https://www.morningbrew.com'
    this.name = 'morningbrew'
  }

  shouldPreHandle(url: string, dom?: Document): boolean {
    const host = this.name + '.com'
    // check if url ends with morningbrew.com
    return new URL(url).hostname.endsWith(host)
  }

  async preHandle(url: string, dom: Document): Promise<PreHandleResult> {
    // retain the width of the cells in the table of market info
    dom.querySelectorAll('.markets-arrow-cell').forEach((td) => {
      const table = td.closest('table')
      if (table) {
        const bubbleTable = table.querySelector('.markets-bubble')
        if (bubbleTable) {
          // replace the nested table with the text
          const e = bubbleTable.querySelector('.markets-table-text')
          e && bubbleTable.parentNode?.replaceChild(e, bubbleTable)
        }
        // set custom class for the table
        table.className = 'morning-brew-markets'
      }
    })

    return Promise.resolve({ dom })
  }

  isNewsletter(postHeader: string, from: string, unSubHeader: string): boolean {
    // Axios newsletter is from <xx@axios.com>
    const re = new RegExp(this.senderRegex)
    return re.test(from) && (!!postHeader || !!unSubHeader)
  }
}
