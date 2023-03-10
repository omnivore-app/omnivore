import { useEffect } from 'react'

const ANCHOR_ELEMENTS_BLOCKED_ATTRIBUTES = [
  'omnivore-highlight-id',
  'data-twitter-tweet-id',
  'data-instagram-id',
]

// We search in reverse so we can find the last element
// that is visible on the page
export const getTopOmnivoreAnchorElement = (
  articleContentElement: HTMLElement
): string | undefined => {
  let lastVisibleAnchor: Element | undefined = undefined
  const anchors = Array.from(
    document.querySelectorAll(`[data-omnivore-anchor-idx]`)
  ).reverse()

  for (const anchor of anchors) {
    const rect = anchor.getBoundingClientRect()
    if (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= articleContentElement.clientHeight
    ) {
      lastVisibleAnchor = anchor
    } else if (lastVisibleAnchor) {
      break
    }
  }

  return (
    lastVisibleAnchor?.getAttribute(`data-omnivore-anchor-idx`) ?? undefined
  )
}

export const useReadingProgressAnchor = (
  articleContentRef: React.MutableRefObject<HTMLDivElement | null>
): void => {
  useEffect(() => {
    parseDomTree(articleContentRef.current)
  }, [articleContentRef])
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
