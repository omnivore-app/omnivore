import { parseHTML } from 'linkedom'

// this code needs to be kept in sync with the
// frontend code in: useReadingProgressAnchor

const ANCHOR_ELEMENTS_BLOCKED_ATTRIBUTES = [
  'omnivore-highlight-id',
  'data-twitter-tweet-id',
  'data-instagram-id',
]

function ssmlTagsForTopLevelElement() {
  return {
    opening: `<p>`,
    closing: `</p>`,
  }
}

function parseDomTree(pageNode: Element) {
  if (!pageNode || pageNode.childNodes.length == 0) {
    console.log(' no child nodes found')
    return []
  }

  const nodesToVisitStack = [pageNode]
  const visitedNodeList = []

  while (nodesToVisitStack.length > 0) {
    const currentNode = nodesToVisitStack.pop()
    if (
      currentNode?.nodeType !== 1 /* Node.ELEMENT_NODE */ ||
      // Avoiding dynamic elements from being counted as anchor-allowed elements
      ANCHOR_ELEMENTS_BLOCKED_ATTRIBUTES.some((attrib) =>
        currentNode.hasAttribute(attrib)
      )
    ) {
      continue
    }

    visitedNodeList.push(currentNode)
    ;[].slice
      .call(currentNode.childNodes)
      .reverse()
      .forEach(function (node) {
        nodesToVisitStack.push(node)
      })
  }

  visitedNodeList.shift()
  visitedNodeList.forEach((node, index) => {
    // start from index 1, index 0 reserved for anchor unknown.
    node.setAttribute('data-omnivore-anchor-idx', (index + 1).toString())
  })
  return visitedNodeList
}

function emit(textItems: string[], text: string) {
  textItems.push(text)
}

function cleanTextNode(textNode: ChildNode): string {
  return (textNode.textContent ?? '').replace(/\s+/g, ' ')
}

function emitTextNode(
  textItems: string[],
  cleanedText: string,
  textNode: ChildNode
) {
  const ssmlElement =
    textNode.parentNode?.nodeName === 'B' ? 'emphasis' : undefined
  if (!cleanedText) {
    return
  }

  if (ssmlElement) {
    emit(textItems, `<${ssmlElement}>`)
  }
  emit(textItems, `${cleanedText}`)
  if (ssmlElement) {
    emit(textItems, `</${ssmlElement}>`)
  }
}

function emitElement(
  textItems: string[],
  element: Element,
  isTopLevel: boolean
) {
  const SKIP_TAGS = ['SCRIPT', 'STYLE', 'IMG', 'FIGURE', 'FIGCAPTION', 'IFRAME']

  const topLevelTags = ssmlTagsForTopLevelElement()
  const idx = element.getAttribute('data-omnivore-anchor-idx')
  let maxVisitedIdx = Number(idx)

  if (isTopLevel) {
    emit(textItems, topLevelTags.opening)
  }

  for (const child of Array.from(element.childNodes)) {
    if (SKIP_TAGS.indexOf(child.nodeName) >= 0) {
      continue
    }

    if (
      child.nodeType == 3 /* Node.TEXT_NODE */ &&
      (child.textContent?.length ?? 0) > 0
    ) {
      const cleanedText = cleanTextNode(child)
      if (idx && cleanedText.length > 1) {
        // Make sure its more than just a space
        emit(textItems, `<bookmark mark="${idx}" />`)
      }
      emitTextNode(textItems, cleanedText, child)
    }
    if (child.nodeType == 1 /* Node.ELEMENT_NODE */) {
      maxVisitedIdx = emitElement(textItems, child as HTMLElement, false)
    }
  }

  if (isTopLevel) {
    emit(textItems, topLevelTags.closing)
  }

  return Number(maxVisitedIdx)
}

export type SSMLItem = {
  open: string
  close: string
  textItems: string[]
}

export type SSMLOptions = {
  primaryVoice: string
  secondaryVoice: string
  rate: string
  language: string
}

const startSsml = (element: Element, options: SSMLOptions): string => {
  const voice =
    element.nodeName === 'BLOCKQUOTE'
      ? options.secondaryVoice
      : options.primaryVoice
  return `
<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="${options.language}"><voice name="${voice}"><prosody rate="${options.rate}" pitch="default">
  `
}

const endSsml = (): string => {
  return `</prosody></voice></speak>`
}

export const ssmlItemText = (item: SSMLItem): string => {
  return [item.open, ...item.textItems, item.close].join('')
}

export const htmlToSsml = (html: string, options: SSMLOptions): SSMLItem[] => {
  console.log('creating ssml with options', options)

  const dom = parseHTML(html)
  const body = dom.document.querySelector('#readability-page-1')
  if (!body) {
    throw new Error('Unable to parse HTML document')
  }

  const parsedNodes = parseDomTree(body)
  if (parsedNodes.length < 1) {
    throw new Error('No HTML nodes found')
  }

  const items: SSMLItem[] = []
  for (let i = 1; i < parsedNodes.length + 1; i++) {
    const textItems: string[] = []
    const node = parsedNodes[i - 1]

    i = emitElement(textItems, node, true)
    items.push({
      open: startSsml(node, options),
      close: endSsml(),
      textItems: textItems,
    })
  }

  return items
}
