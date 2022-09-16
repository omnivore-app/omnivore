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
    dom
      .querySelectorAll('.markets-arrow-cell')
      .forEach((c) => c.setAttribute('width', '20%'))
    dom
      .querySelectorAll('.markets-ticker-cell')
      .forEach((c) => c.setAttribute('width', '34%'))
    dom
      .querySelectorAll('.markets-value-cell')
      .forEach((c) => c.setAttribute('width', '34%'))
    dom.querySelectorAll('.markets-bubble-cell').forEach((c) => {
      const table = c.querySelector('.markets-bubble')
      if (table) {
        // replace the nested table with the text
        const e = table.querySelector('.markets-table-text')
        e && table.parentNode?.replaceChild(e, table)
      }
      c.setAttribute('width', '12%')
    })
    dom
      .querySelectorAll('table [role="presentation"]')
      .forEach((table) => (table.className = 'morning-brew-markets'))

    return Promise.resolve(dom)
  }
}
