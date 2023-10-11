const ANCHOR_ELEMENTS_BLOCKED_ATTRIBUTES = [
  'omnivore-highlight-id',
  'data-twitter-tweet-id',
  'data-instagram-id',
]

export const clampToPercent = (float: number) => {
  return Math.floor(Math.max(0, Math.min(100, float)))
}

// We search in reverse so we can find the last element
// that is visible on the page
export const getTopOmnivoreAnchorElement = (
  articleContentElement: HTMLElement
): string | undefined => {
  let topVisibleRect: Element | undefined = undefined
  const anchors = Array.from(
    document.querySelectorAll(`p[data-omnivore-anchor-idx]`)
  ).reverse()

  for (const anchor of anchors) {
    const rect = anchor.getBoundingClientRect()
    if (
      rect.height > 0 &&
      rect.top >= 50 &&
      rect.bottom <= articleContentElement.clientHeight
    ) {
      if (
        topVisibleRect &&
        topVisibleRect.getBoundingClientRect().top < rect.top
      ) {
        continue
      }
      topVisibleRect = anchor
    }
  }

  return topVisibleRect?.getAttribute(`data-omnivore-anchor-idx`) ?? undefined
}

export function parseDomTree(
  pageNode: HTMLDivElement | null
): HTMLDivElement[] {
  if (!pageNode || pageNode.childNodes.length == 0) {
    return []
  }

  const nodesToVisitStack: [HTMLDivElement] = [pageNode]
  const visitedNodeList = []

  while (nodesToVisitStack.length > 0) {
    const currentNode = nodesToVisitStack.pop()
    if (
      currentNode?.nodeType !== Node.ELEMENT_NODE ||
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
