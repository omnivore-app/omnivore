/* global
  browserApi
  XMLHttpRequest
  ACTIONS
  ENV_DOES_NOT_SUPPORT_BLOB_URL_ACCESS
*/

'use strict'
;(function () {
  const iframes = {}

  browserApi.runtime.onMessage.addListener(
    ({ action, payload }, sender, sendResponse) => {
      if (action !== ACTIONS.AddIframeContent) return
      const { url, content } = payload
      iframes[url] = content
      sendResponse({})
    }
  )

  async function grabPdfContent() {
    const fileExtension = window.location.pathname.slice(-4).toLowerCase()
    const hasPdfExtension = fileExtension === '.pdf'
    const pdfContentTypes = [
      'application/acrobat',
      'application/pdf',
      'application/x-pdf',
      'applications/vnd.pdf',
      'text/pdf',
      'text/x-pdf',
    ]
    const isPdfContent = pdfContentTypes.indexOf(document.contentType) !== -1
    if (!hasPdfExtension && !isPdfContent) {
      return Promise.resolve(null)
    }

    const embedEl = document.querySelector('embed')
    if (embedEl && embedEl.type !== 'application/pdf') {
      return Promise.resolve(null)
    }

    if (ENV_DOES_NOT_SUPPORT_BLOB_URL_ACCESS && embedEl.src) {
      return Promise.resolve({ type: 'url', uploadContentObjUrl: embedEl.src })
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      // load `document` from `cache`
      xhr.open('GET', '', true)
      xhr.responseType = 'blob'
      xhr.onload = function (e) {
        if (this.status === 200) {
          resolve({
            type: 'pdf',
            uploadContentObjUrl: URL.createObjectURL(this.response),
          })
        } else {
          reject(e)
        }
      }
      xhr.send()
    })
  }

  function prepareContentPostItem(itemEl) {
    const lowerTagName = itemEl.tagName.toLowerCase()

    if (lowerTagName === 'iframe') {
      const frameHtml = iframes[itemEl.src]
      if (!frameHtml) return

      const containerEl = document.createElement('div')
      containerEl.className = 'omnivore-instagram-embed'
      containerEl.innerHTML = frameHtml

      const parentEl = itemEl.parentNode
      if (!parentEl) return

      parentEl.replaceChild(containerEl, itemEl)

      return
    }

    if (lowerTagName === 'img' || lowerTagName === 'image') {
      // Removing blurred images since they are mostly the copies of lazy loaded ones
      const style = window.getComputedStyle(itemEl)
      const filter = style.getPropertyValue('filter')
      if (filter.indexOf('blur(') === -1) return
      itemEl.remove()
      return
    }

    const style = window.getComputedStyle(itemEl)
    const backgroundImage = style.getPropertyValue('background-image')

    // convert all nodes with background image to img nodes
    const noBackgroundImage = !backgroundImage || backgroundImage === 'none'
    if (!noBackgroundImage) return

    const filter = style.getPropertyValue('filter')
    // avoiding image nodes with a blur effect creation
    if (filter && filter.indexOf('blur(') !== -1) {
      itemEl.remove()
      return
    }

    // Replacing element only of there are no content inside, b/c might remove important div with content.
    // Article example: http://www.josiahzayner.com/2017/01/genetic-designer-part-i.html
    // DIV with class "content-inner" has `url("https://resources.blogblog.com/blogblog/data/1kt/travel/bg_container.png")` background image.

    if (itemEl.src) return
    if (itemEl.innerHTML.length > 24) return

    const BI_SRC_REGEXP = /url\("(.+?)"\)/gi
    const matchedSRC = BI_SRC_REGEXP.exec(backgroundImage)
    // Using "g" flag with a regex we have to manually break down lastIndex to zero after every usage
    // More details here: https://stackoverflow.com/questions/1520800/why-does-a-regexp-with-global-flag-give-wrong-results
    BI_SRC_REGEXP.lastIndex = 0

    const targetSrc = matchedSRC && matchedSRC[1]
    if (!targetSrc) return

    const imgEl = document.createElement('img')
    imgEl.src = targetSrc
    const parentEl = itemEl.parentNode
    if (!parentEl) return

    parentEl.replaceChild(imgEl, itemEl)
  }

  function prepareContentPostScroll() {
    const contentCopyEl = document.createElement('div')
    contentCopyEl.style.position = 'absolute'
    contentCopyEl.style.left = '-2000px'
    contentCopyEl.style.zIndex = '-2000'
    contentCopyEl.innerHTML = document.body.innerHTML
    const dir = document.dir

    // Appending copy of the content to the DOM to enable computed styles capturing ability
    // Without adding that copy to the DOM the `window.getComputedStyle` method will always return undefined.
    document.documentElement.appendChild(contentCopyEl)

    Array.from(contentCopyEl.getElementsByTagName('*')).forEach(
      prepareContentPostItem
    )

    /*
     * Grab head and body separately as using clone on entire document into a div
     * removes the head and body tags while grabbing html in them. Instead we
     * capture them separately and concatenate them here with head and body tags
     * preserved.
     */
    const contentCopyHtml = `<html ${dir.toLowerCase() === 'rtl' ? 'dir="rtl"': ''}><head>${document.head.innerHTML}</head><body>${contentCopyEl.innerHTML}</body></html>`
    // Cleaning up the copy element
    contentCopyEl.remove()
    return contentCopyHtml
  }

  function createBackdrop() {
    const backdropEl = document.createElement('div')
    backdropEl.className = 'webext-omnivore-backdrop'
    backdropEl.style.cssText = `all: initial !important;
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
      z-index: 99999 !important;
      background: #fff !important;
      opacity: 0.8 !important;
      transition: opacity 0.3s !important;
      -webkit-backdrop-filter: blur(4px) !important;
      backdrop-filter: blur(4px) !important;
    `
    return backdropEl
  }

  const getQuoteText = (containerNode) => {
    const nonParagraphTagsRegEx =
      /^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u|code|mark)$/i

    let textResult = ''
    let newParagraph = false

    const getTextNodes = (node) => {
      let isPre = false
      const nodeElement =
        node instanceof HTMLElement ? node : node.parentElement
      if (nodeElement) {
        isPre = window
          .getComputedStyle(nodeElement)
          .whiteSpace.startsWith('pre')
      }

      if (node.nodeType == 3) {
        const text = isPre ? node.nodeValue : node.nodeValue.replace(/\n/g, '')
        textResult += text
      } else if (node != containerNode) {
        if (!nonParagraphTagsRegEx.test(node.tagName)) {
          textResult += '\n\n'
        }
      }

      const children = node.childNodes
      children.forEach(function (child) {
        getTextNodes(child)
      })
    }

    getTextNodes(containerNode)

    return textResult.trim()
  }

  const markHighlightSelection = () => {
    // First remove any previous markers, this would only normally happen during debugging
    try {
      const markers = window.document.querySelectorAll(
        `span[data-omnivore-highlight-start="true"],
         span[data-omnivore-highlight-end="true"]`
      )

      for (let i = 0; i < markers.length; i++) {
        markers[i].remove()
      }
    } catch (error) {
      console.log('remove marker error: ', error)
      // This should be OK
    }
    try {
      const sel = window.getSelection()
      if (sel.rangeCount) {
        const range = sel.getRangeAt(0)
        const endMarker = document.createElement('span')
        const startMarker = document.createElement('span')
        endMarker.setAttribute('data-omnivore-highlight-end', 'true')
        startMarker.setAttribute('data-omnivore-highlight-start', 'true')

        var container = document.createElement('div')
        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
          container.appendChild(sel.getRangeAt(i).cloneContents())
        }

        const endRange = range.cloneRange()
        endRange.collapse(false)
        endRange.insertNode(endMarker)

        range.insertNode(startMarker)

        return {
          highlightHTML: container.innerHTML,
          highlightText: getQuoteText(container),
        }
      }
    } catch (error) {
      console.log('get text error', error)
    }
    return null
  }

  function clearExistingBackdrops() {
    const backdropCol = document.querySelectorAll('.webext-omnivore-backdrop')
    for (let i = 0; i < backdropCol.length; i++) {
      const backdropEl = backdropCol[i]
      backdropEl.style.setProperty('opacity', '0', 'important')
    }

    setTimeout(() => {
      for (let i = 0; i < backdropCol.length; i++) {
        backdropCol[i].remove()
      }
    }, 0.5e3)
  }

  async function prepareContent(createHighlight) {
    const pdfContent = await grabPdfContent()
    if (pdfContent) {
      return pdfContent
    }
    const url = window.location.href
    try {
      if (!createHighlight && handleBackendUrl(url)) {
        return { type: 'url' }
      }
    } catch {
      console.log('error checking url')
    }

    console.log('get content: ', createHighlight)
    if (createHighlight) {
      console.log('creating highlight while saving')
      const highlightSelection = markHighlightSelection()
      console.log('highlightSelection', highlightSelection)
    }

    async function scrollPage(url) {
      const scrollingEl = document.scrollingElement || document.body
      const lastScrollPos = scrollingEl.scrollTop
      const currentScrollHeight = scrollingEl.scrollHeight

      /* add blurred overlay while scrolling */
      clearExistingBackdrops()

      const backdropEl = createBackdrop()
      document.body.appendChild(backdropEl)

      /*
       * check below compares scrollTop against initial page height to handle
       * pages with infinite scroll else we shall be infinitely scrolling here.
       * stop scrolling if the url has changed in the meantime.
       */
      while (
        scrollingEl.scrollTop <= currentScrollHeight - 500 &&
        window.location.href === url
      ) {
        const prevScrollTop = scrollingEl.scrollTop
        scrollingEl.scrollTop += 500
        /* sleep upon scrolling position change for event loop to handle events from scroll */
        await new Promise((resolve) => {
          setTimeout(resolve, 10)
        })
        if (scrollingEl.scrollTop === prevScrollTop) {
          /* break out scroll loop if we are not able to scroll for any reason */
          // console.log('breaking out scroll loop', scrollingEl.scrollTop, currentScrollHeight);
          break
        }
      }
      scrollingEl.scrollTop = lastScrollPos
      /* sleep upon scrolling position change for event loop to handle events from scroll */
      await new Promise((resolve) => {
        setTimeout(resolve, 10)
      })
    }
    await scrollPage(url)

    clearExistingBackdrops()
    return { type: 'html', content: prepareContentPostScroll() }
  }

  window.prepareContent = prepareContent
})()
