export class GolangHandler {
  name = 'golangweekly'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldPrehandle = (url: URL, _dom: Document): boolean => {
    const host = this.name + '.com'
    // check if url ends with golangweekly.com
    return url.hostname.endsWith(host)
  }

  prehandle = (url: URL, dom: Document): Promise<Document> => {
    const body = dom.querySelector('body')

    // this removes the "Subscribe" button
    body?.querySelector('.el-splitbar')?.remove()
    // this removes the title
    body?.querySelector('.el-masthead')?.remove()

    return Promise.resolve(dom)
  }
}
