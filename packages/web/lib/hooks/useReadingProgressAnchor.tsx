import { useEffect } from 'react'

const ANCHOR_ELEMENTS_BLOCKED_ATTRIBUTES = [
  'omnivore-highlight-id',
  'data-twitter-tweet-id',
  'data-instagram-id',
]

export const useReadingProgressAnchor = (
  articleContentRef: React.MutableRefObject<HTMLDivElement | null>,
  setReadingAnchorIndex: React.Dispatch<React.SetStateAction<number>>
): void => {
  useEffect(() => {
    const visitedNodeList = parseDomTree(articleContentRef.current)
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      // we only track elements on becoming completely visible.
      threshold: [1],
    }

    function intersectionCallback(entries: IntersectionObserverEntry[]): void {
      let topIntersectingElemId = 0
      let minTopElem = 100000
      entries.forEach(function (entry: IntersectionObserverEntry) {
        const elem = entry.target
        const elemId = elem.getAttribute('data-omnivore-anchor-idx') || '0'

        if (entry.isIntersecting && entry.intersectionRatio === 1) {
          // Among all intersecting elements, find the topmost element.
          if (entry.boundingClientRect.top < minTopElem) {
            minTopElem = entry.boundingClientRect.top
            topIntersectingElemId = parseInt(elemId)
          }
        }
      })

      if (topIntersectingElemId > 0) {
        /*
         * Intersection observer is great in finding us the last element on the
         * page that becomes visible on scroll. But for better user experience
         * we are interested in the topmost element visible on the page that we
         * can scroll to at the top on the next article page reader view. We
         * iterate in reverse over anchor elements here us to find the topmost
         * visible element.
         */
        let topVisibleElemId = topIntersectingElemId
        while (topVisibleElemId - 1 > 0) {
          const elem = document.querySelector(
            `[data-omnivore-anchor-idx='${(topVisibleElemId - 1).toString()}']`
          )
          if (elem) {
            const rect = elem.getBoundingClientRect()
            if (
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
              rect.right <=
                (window.innerWidth || document.documentElement.clientWidth)
            ) {
              /* Is Visible */
              topVisibleElemId = topVisibleElemId - 1
            } else {
              break
            }
          } else {
            // Prevents the Event loop from the eternal blocking
            throw new Error('Unable to find previous intersection element!')
          }
        }
        setReadingAnchorIndex(topVisibleElemId)
      }
    }

    const nodeObserver = new IntersectionObserver(
      intersectionCallback,
      observerOptions
    )
    visitedNodeList?.forEach((elem) => {
      nodeObserver.observe(elem)
    })

    return () => {
      nodeObserver.disconnect()
    }
  }, [articleContentRef, setReadingAnchorIndex])
}

function parseDomTree(pageNode: HTMLDivElement | null): HTMLDivElement[] {
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
