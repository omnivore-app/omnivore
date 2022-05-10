export class AxiosHandler {
  name = 'axios'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldPrehandle = (url: URL, _dom: Document): boolean => {
    const host = this.name + '.com'
    // check if url ends with axios.com
    return url.hostname.endsWith(host)
  }

  prehandle = (url: URL, dom: Document): Promise<Document> => {
    const body = dom.querySelector('table')

    // this removes ads and replaces table with a div
    body?.querySelectorAll('table').forEach((el, k) => {
      if (k > 0) {
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
      }
    })

    return Promise.resolve(dom)
  }
}
