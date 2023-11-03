var ShareExtension = function() {};

const iconURL = () => {
  try {
    const previewImage = document.querySelector("meta[property='og:image'], meta[name='twitter:image']")
    if (previewImage && previewImage.getAttribute("content")) { return previewImage.getAttribute("content") }

    const appleImage = document.querySelector("link[rel='apple-touch-icon'], link[rel='shortcut icon'], link[rel='icon']")
    if (appleImage && appleImage.getAttribute("href")) { return appleImage.getAttribute("href") }

    const href = new URL(document.location.href)
    href.pathname = '/favicon.ico'

    return href.toString()
  } catch {}
  return undefined
}

const getQuoteText = (containerNode) => {
  const nonParagraphTagsRegEx =
  /^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u|code|mark)$/i

  let textResult = ''
  let newParagraph = false

  const getTextNodes = (node) => {
    let isPre = false
    const nodeElement = (node instanceof HTMLElement) ? node : node.parentElement
    if (nodeElement) {
      isPre = (window.getComputedStyle(nodeElement).whiteSpace.startsWith('pre'))
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
    children.forEach(function (child){
      getTextNodes(child)
    });
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
      markers[i].remove();
    }
  } catch (error) {
    console.log('remove marker error: ', error)
    // This should be OK
  }
  try {
    const sel = window.getSelection()
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0)
      const endMarker = document.createElement("span")
      const startMarker = document.createElement("span")
      endMarker.setAttribute("data-omnivore-highlight-end", "true")
      startMarker.setAttribute("data-omnivore-highlight-start", "true")

      var container = document.createElement("div")
      for (var i = 0, len = sel.rangeCount; i < len; ++i) {
        container.appendChild(sel.getRangeAt(i).cloneContents())
      }

      const endRange = range.cloneRange()
      endRange.collapse(false)
      endRange.insertNode(endMarker)

      range.insertNode(startMarker)

      return {
        highlightHTML: container.innerHTML,
        highlightText: getQuoteText(container)
      }
    }
  } catch(error) {
    console.log("get text error", error)
  }
  return null
}

ShareExtension.prototype = {
    run: function(arguments) {
        const highlightData = markHighlightSelection()

        arguments.completionFunction({
          'url': window.location.href,
          'title': document.title.toString(),
          'iconURL': iconURL(),
          'contentType': document.contentType,
          'originalHTML': new XMLSerializer().serializeToString(document),
          ...highlightData
        })
    }
}

var ExtensionPreprocessingJS = new ShareExtension();
