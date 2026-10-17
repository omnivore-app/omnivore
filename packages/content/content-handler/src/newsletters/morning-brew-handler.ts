import { ContentHandler } from '../content-handler'

export class MorningBrewHandler extends ContentHandler {
  constructor() {
    super()
    this.senderRegex = /Morning Brew <crew@morningbrew.com>/
    this.urlRegex = /<a.* href=["']([^"']*)["'].*>View Online<\/a>/
    this.name = 'morningbrew'
  }

  shouldPreParse(url: string, dom: Document): boolean {
    const host = this.name + '.com'
    // check if url ends with morningbrew.com
    return new URL(url).hostname.endsWith(host)
  }

  async preParse(url: string, dom: Document): Promise<Document> {
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

    return Promise.resolve(dom)
  }
}
