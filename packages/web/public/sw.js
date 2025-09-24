/* global
  globalThis
  self
  Response
*/

'use strict'
;(function () {
  const globalApi = (typeof globalThis !== 'undefined' && globalThis) || self

  const mainOrigin = 'https://omnivore.work'
  const devOrigin = 'https://dev.omnivore.work'
  const demoOrigin = 'https://demo.omnivore.work'
  const webProdOrigin = 'https://web-prod.omnivore.work'
  const webDemoOrigin = 'https://web-demo.omnivore.work'

  const currentOrigin =
    (globalApi.location && globalApi.location.origin) || mainOrigin

  if (
    currentOrigin !== mainOrigin &&
    currentOrigin !== devOrigin &&
    currentOrigin !== demoOrigin &&
    currentOrigin !== webProdOrigin &&
    currentOrigin !== webDemoOrigin
  )
    return

  function findShareUrlInText(formData) {
    const url = formData.get('url') || ''
    const text = formData.get('text') || ''
    const title = formData.get('title') || ''

    const allParts = [url, text, title].join(' ')
    const snippets = allParts.split(/\s+/)

    for (let i = 0; i < snippets.length; i++) {
      try {
        const shareUrl = new URL(snippets[i])
        return shareUrl
      } catch (e) {}
    }
  }

  globalApi.addEventListener('fetch', (ev) => {
    if (ev.request.destination === 'script') {
      return
    }
    if (ev.request.destination === 'image') {
      return
    }

    if (
      ev.request.method === 'POST' &&
      ev.request.url.endsWith('/share-target')
    ) {
      ev.respondWith(
        (async () => {
          const formData = await ev.request.formData()
          const sharedUrl = findShareUrlInText(formData)
          return Response.redirect(`/api/save?url=${sharedUrl}`, 303)
        })()
      )
    }
  })
})()

console.log('activated service worker')
