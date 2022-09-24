export class MorningBrewHandler {
  name = 'morningbrew'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldPrehandle = (url: URL, _dom: Document): boolean => {
    const host = this.name + '.com'
    // check if url ends with morningbrew.com
    return url.hostname.endsWith(host)
  }

  prehandle = (url: URL, dom: Document): Promise<Document> => {
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
