export class SubstackHandler {
  name = 'substack'

  shouldPrehandle = (url: URL, dom: Document): boolean => {
    const host = this.name + '.com'
    // check if url ends with substack.com
    // or has a profile image hosted at substack.com
    return (
      url.hostname.endsWith(host) ||
      !!dom
        .querySelector('.email-body img')
        ?.getAttribute('src')
        ?.includes(host)
    )
  }

  prehandle = (url: URL, dom: Document): Promise<Document> => {
    const body = dom.querySelector('.email-body-container')

    // this removes header and profile avatar
    body?.querySelector('.header')?.remove()
    body?.querySelector('.preamble')?.remove()
    body?.querySelector('.meta-author-wrap')?.remove()
    // this removes meta button
    body?.querySelector('.post-meta')?.remove()
    // this removes footer
    body?.querySelector('.post-cta')?.remove()
    body?.querySelector('.container-border')?.remove()
    body?.querySelector('.footer')?.remove()

    return Promise.resolve(dom)
  }
}
