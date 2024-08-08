import { useCallback, useEffect, useState } from 'react'
import {
  retrieveOffsetsForSelection,
  getHighlightElements,
  HighlightLocation,
} from './highlightGenerator'
import type { SelectionAttributes } from './highlightHelpers'

/**
 * Get the range of text with {@link SelectionAttributes} that user has selected
 *
 * Event Handlers for detecting/using new highlight selection are registered
 *
 * If the new highlight selection overlaps with existing highlights, the new selection is merged.
 *
 * @param highlightLocations existing highlights
 * @returns selection range and its setter
 */
export function useSelection(
  highlightLocations: HighlightLocation[]
): [SelectionAttributes | null, (x: SelectionAttributes | null) => void] {
  const [touchStartPos, setTouchStartPos] = useState<
    { x: number; y: number } | undefined
  >(undefined)
  const [selectionAttributes, setSelectionAttributes] =
    useState<SelectionAttributes | null>(null)

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      setTouchStartPos({
        x: event.touches[0].pageX,
        y: event.touches[0].pageY,
      })
    },
    [touchStartPos, setTouchStartPos]
  )

  const handleFinishTouch = useCallback(
    async (mouseEvent: any) => {
      let wasDragEvent = false
      const tapAttributes = {
        tapX: mouseEvent.clientX,
        tapY: mouseEvent.clientY,
      }

      if (touchStartPos) {
        if (
          Math.abs(touchStartPos.x - mouseEvent.pageX) > 10 ||
          Math.abs(touchStartPos.y - mouseEvent.pageY) > 10
        ) {
          wasDragEvent = true
        }
      }

      window?.AndroidWebKitMessenger?.handleIdentifiableMessage(
        'userTap',
        JSON.stringify(tapAttributes)
      )

      const result = await makeSelectionRange()

      if (!result) {
        return setTimeout(() => {
          setSelectionAttributes(null)
        }, 100)
      }

      const { range, isReverseSelected, selection } = result
      const [selectionStart, selectionEnd] = retrieveOffsetsForSelection(range)
      const rangeRect = rangeToPos(range, isReverseSelected)

      let shouldCancelSelection = false
      const overlapHighlights: HighlightLocation[] = []

      highlightLocations
        .sort((a, b) => {
          if (a.start < b.start) {
            return -1
          }
          if (a.start > b.start) {
            return 1
          }
          return 0
        })
        .forEach((highlightLocation) => {
          // Cancel operations if highlight is subset of existing highlight
          if (
            selectionStart >= highlightLocation.start &&
            selectionEnd <= highlightLocation.end
          ) {
            shouldCancelSelection = true
            return
          }

          if (
            selectionStart < highlightLocation.end &&
            highlightLocation.start < selectionEnd
          ) {
            overlapHighlights.push(highlightLocation)
          }
        })

      /* If selection overlaps existing highlights, compute and return the merged selection range */
      let mergedRange = null
      if (overlapHighlights.length) {
        let startNode, startOffset
        let endNode, endOffset
        let extendEndNode = false

        if (selectionStart <= overlapHighlights[0].start) {
          startNode = range.startContainer
          startOffset = range.startOffset
        } else {
          const highlightElems = getHighlightElements(overlapHighlights[0].id)
          startNode = highlightElems.shift()
          startOffset = 0
        }
        if (
          selectionEnd >= overlapHighlights[overlapHighlights.length - 1].end
        ) {
          endNode = range.endContainer
          endOffset = range.endOffset
        } else {
          const highlightElems = getHighlightElements(
            overlapHighlights[overlapHighlights.length - 1].id
          )
          endNode = highlightElems.pop()
          endOffset = 0
          /* end node is from highlight span, we must extend range until the end of highlight span */
          extendEndNode = true
        }
        if (!startNode || !endNode) {
          throw new Error('Failed to query node for computing new merged range')
        }
        mergedRange = new Range()
        mergedRange.setStart(startNode, startOffset)
        if (extendEndNode) {
          /* Extend the range to include the entire endNode container */
          mergedRange.setEndAfter(endNode)
        } else {
          mergedRange.setEnd(endNode, endOffset)
        }
      }

      if (shouldCancelSelection) {
        return setTimeout(() => {
          setSelectionAttributes(null)
        }, 100)
      }

      return setSelectionAttributes({
        selection,
        wasDragEvent,
        range: mergedRange ?? range,
        focusPosition: {
          x: rangeRect[isReverseSelected ? 'left' : 'right'],
          y: rangeRect[isReverseSelected ? 'top' : 'bottom'],
          isReverseSelected,
        },
        overlapHighlights: overlapHighlights.map(({ id }) => id),
      })
    },
    [touchStartPos, selectionAttributes, highlightLocations]
  )

  const copyTextSelection = useCallback(async () => {
    // Send message to Android to paste since we don't have the
    // correct permissions to write to clipboard from WebView directly
    window.AndroidWebKitMessenger?.handleIdentifiableMessage(
      'writeToClipboard',
      JSON.stringify({ quote: selectionAttributes?.selection.toString() })
    )
  }, [selectionAttributes?.selection])

  useEffect(() => {
    document.addEventListener('mouseup', handleFinishTouch)
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleFinishTouch)
    document.addEventListener('contextmenu', handleFinishTouch)
    document.addEventListener('copyTextSelection', copyTextSelection)

    return () => {
      document.removeEventListener('mouseup', handleFinishTouch)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleFinishTouch)
      document.removeEventListener('contextmenu', handleFinishTouch)
      document.removeEventListener('copyTextSelection', copyTextSelection)
    }
  }, [
    highlightLocations,
    handleFinishTouch,
    copyTextSelection,
    touchStartPos,
    setTouchStartPos,
    handleTouchStart,
  ])

  return [selectionAttributes, setSelectionAttributes]
}

type MakeSelectionRangeOutput = {
  range: Range
  selection: Selection
  isReverseSelected: boolean
}

async function makeSelectionRange(): Promise<
  MakeSelectionRangeOutput | undefined
> {
  // Getting the selection a little bit after the mouseup event b/c the mouseup event is triggered earlier
  // than the selection is getting cleared
  const selection = await new Promise<Selection | null>((resolve) => {
    setTimeout(() => {
      resolve(document.getSelection())
    }, 100)
  })

  if (!selection || selection.isCollapsed || selection.rangeCount <= 0) {
    return undefined
  }

  const articleContentElement = document.getElementById('article-container')
  const recommendationsElement = document.getElementById(
    'recommendations-container'
  )

  if (!articleContentElement)
    throw new Error('Unable to find the article content element')

  const allowedRange = new Range()
  allowedRange.selectNode(articleContentElement)

  const range = selection.getRangeAt(0)

  if (recommendationsElement && range.intersectsNode(recommendationsElement)) {
    console.log('attempt to highlight in recommendations area')
    return undefined
  }

  const start = range.compareBoundaryPoints(Range.START_TO_START, allowedRange)
  const end = range.compareBoundaryPoints(Range.END_TO_END, allowedRange)
  const isRangeAllowed = start >= 0 && end <= 0

  const isReverseSelected =
    range.startContainer === selection.focusNode &&
    range.endOffset === selection.anchorOffset

  /**
   * Edge case:
   * If the selection ends on range endContainer (or startContainer in reverse select) but no text is selected (i.e. selection ends at
   * an empty area), the preceding text is highlighted due to range normalizing.
   * This is a visual bug and would sometimes lead to weird highlight behavior during removal.
   */
  const selectionEndNode = selection.focusNode
  const selectionEndOffset = selection.focusOffset
  const selectionStartNode = isReverseSelected
    ? range.endContainer
    : range.startContainer

  if (selectionEndNode?.nodeType === Node.TEXT_NODE) {
    const selectionEndNodeEdgeIndex = isReverseSelected
      ? selectionEndNode.textContent?.length
      : 0

    if (
      selectionStartNode !== selectionEndNode &&
      selectionEndOffset == selectionEndNodeEdgeIndex
    ) {
      clipRangeToNearestAnchor(range, selectionEndNode, isReverseSelected)
    }
  }

  return isRangeAllowed ? { range, isReverseSelected, selection } : undefined
}

/**
 * Clip selection range to the beginning/end of the adjacent anchor element
 *
 * @param range selection range
 * @param selectionEndNode the node where the selection ended at
 * @param isReverseSelected
 */
const clipRangeToNearestAnchor = (
  range: Range,
  selectionEndNode: Node,
  isReverseSelected: boolean
) => {
  let nearestAnchorElement = selectionEndNode.parentElement
  while (
    nearestAnchorElement !== null &&
    !nearestAnchorElement.hasAttribute('data-omnivore-anchor-idx')
  ) {
    nearestAnchorElement = nearestAnchorElement.parentElement
  }
  if (!nearestAnchorElement) {
    throw Error(
      'Unable to find nearest anchor element for node: ' + selectionEndNode
    )
  }
  let anchorId = Number(
    nearestAnchorElement.getAttribute('data-omnivore-anchor-idx')!
  )
  let adjacentAnchorId, adjacentAnchor, adjacentAnchorOffset
  if (isReverseSelected) {
    // move down to find adjacent anchor node and clip at its beginning
    adjacentAnchorId = anchorId + 1
    adjacentAnchor = document.querySelectorAll(
      `[data-omnivore-anchor-idx='${adjacentAnchorId}']`
    )[0]
    adjacentAnchorOffset = 0
    range.setStart(adjacentAnchor, adjacentAnchorOffset)
  } else {
    // move up to find adjacent anchor node and clip at its end
    do {
      adjacentAnchorId = --anchorId
      adjacentAnchor = document.querySelectorAll(
        `[data-omnivore-anchor-idx='${adjacentAnchorId}']`
      )[0]
    } while (adjacentAnchor.contains(selectionEndNode))
    if (adjacentAnchor.textContent) {
      let lastTextNodeChild = adjacentAnchor.lastChild
      while (
        !!lastTextNodeChild &&
        lastTextNodeChild.nodeType !== Node.TEXT_NODE
      ) {
        lastTextNodeChild = lastTextNodeChild.previousSibling
      }
      adjacentAnchor = lastTextNodeChild
      adjacentAnchorOffset = adjacentAnchor?.nodeValue?.length ?? 0
    } else {
      adjacentAnchorOffset = 0
    }
    if (adjacentAnchor) {
      range.setEnd(adjacentAnchor, adjacentAnchorOffset)
    }
  }
}

export type RangeEndPos = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

/**
 * Return coordinates of the screen area occupied by the last line of user selection
 *
 * @param range range of user selection
 * @param getFirst whether to get first line of user selection. Get last if false (default)
 * @returns {RangeEndPos} selection coordinates
 */
const rangeToPos = (range: Range, getFirst = false): RangeEndPos => {
  if (typeof window === 'undefined' || !range) {
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
  }

  const rects = range.getClientRects()

  if (!rects || !rects.length) {
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
  }

  const rect = rects[getFirst ? 0 : rects.length - 1]
  return {
    left: window.scrollX + rect.left,
    top: window.scrollY + rect.top - 60,
    right: window.scrollX + rect.right,
    bottom: window.scrollY + rect.bottom + 5,
    width: rect.width,
    height: rect.height,
  }
}
