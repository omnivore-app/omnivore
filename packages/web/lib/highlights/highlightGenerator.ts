import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch'
import { RefObject } from 'react'
import type { Highlight } from '../networking/fragments/highlightFragment'
import { interpolationSearch } from './interpolationSearch'
import {
  highlightIdAttribute,
  highlightLabelIdAttribute,
  highlightNoteIdAttribute,
  labelsImage,
  noteImage,
} from './highlightHelpers'

const highlightTag = 'omnivore_highlight'
const highlightClassname = 'highlight'
const highlightWithNoteClassName = 'highlight_with_note'
const articleContainerId = 'article-container'
export const maxHighlightLength = 6000

const nonParagraphTagsRegEx =
  /^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u|code|mark)$/i
const highlightContentRegex = new RegExp(
  `<${highlightTag}>([\\s\\S]*)<\\/${highlightTag}>`,
  'i'
)
const maxDeepPatchDistance = 4000
const maxDeepPatchThreshhold = 0.5
const maxSurroundingTextLength = 2000

/**
 * Wrapper for text node
 *
 * @property startIndex - offset from the start of article for which the text begins
 * @property node - the text node
 * @property startsParagraph - whether a new paragraph is started
 */
type TextNode = {
  startIndex: number
  node: Node
  startsParagraph?: boolean // TODO: rename to isParagraphStart?
}

type ArticleTextContent = {
  textNodes: TextNode[]
  articleText: string
}

/**
 * Location of a highlight as starting/ending offset from the start of article. The end offset is non-inclusive
 */
export type HighlightLocation = {
  id: string
  start: number
  end: number
}

/**
 * Relevant attributes of a highlight node created in DOM
 */
export type HighlightNodeAttributes = {
  prefix: string
  suffix: string
  quote: string
  startLocation: number
  endLocation: number
}

export function makeHighlightStartEndOffset(
  highlight: Highlight
): HighlightLocation {
  const { startLocation: highlightTextStart, endLocation: highlightTextEnd } =
    nodeAttributesFromHighlight(highlight)
  return {
    id: highlight.id,
    start: highlightTextStart,
    end: highlightTextEnd,
  }
}

function nodeAttributesFromHighlight(
  highlight: Highlight
): HighlightNodeAttributes {
  const patch = highlight.patch
  const id = highlight.id
  const withNote = !!highlight.annotation
  const withLabels = (highlight.labels?.length ?? 0) > 0
  const tooltip = undefined
  const customColor = highlight.color

  return makeHighlightNodeAttributes(
    patch,
    id,
    withNote,
    withLabels,
    customColor,
    tooltip
  )
}

/**
 * Make a highlight on the highlight selection and return its attributes
 *
 * @param patch - {@link generateDiffPatch|patch} of the highlight location
 * @param id - highlight id
 * @param withNote - whether highlight has notes
 * @param customColor - color of highlight
 * @param tooltip
 * @returns relevant highlight attributes
 */
export function makeHighlightNodeAttributes(
  patch: string,
  id: string,
  withNote: boolean,
  withLabels: boolean,
  customColor?: string,
  tooltip?: string
): HighlightNodeAttributes {
  const {
    prefix,
    suffix,
    highlightTextStart,
    highlightTextEnd,
    textNodes,
    textNodeIndex,
  } = getPrefixAndSuffix({ patch })

  let startingTextNodeIndex = textNodeIndex
  let lastElement: Element | undefined,
    quote = ''

  const existing = getHighlightElements(id)
  if (existing.length) {
    return {
      prefix,
      suffix,
      quote,
      startLocation: highlightTextStart,
      endLocation: highlightTextEnd,
    }
  }

  while (highlightTextEnd > textNodes[startingTextNodeIndex].startIndex) {
    const { node, textPartsToHighlight, startsParagraph } = fillHighlight({
      textNodes,
      startingTextNodeIndex,
      highlightTextStart,
      highlightTextEnd,
    })
    const { parentNode, nextSibling } = node

    if (node.textContent && !/[^\t\n\r ]/.test(node.textContent)) {
      startingTextNodeIndex++
      continue
    }

    let isPre = false
    const nodeElement = node instanceof HTMLElement ? node : node.parentElement
    if (nodeElement) {
      isPre = window.getComputedStyle(nodeElement).whiteSpace.startsWith('pre')
    }

    parentNode?.removeChild(node)
    textPartsToHighlight.forEach(({ highlight, text: rawText }, i) => {
      // If we are not in preformatted text, prevent hardcoded \n,
      // we'll create new-lines based on the startsParagraph data
      const text = isPre ? rawText : rawText.replace(/\n/g, '')
      const newTextNode = document.createTextNode(rawText)

      if (!highlight) {
        return parentNode?.insertBefore(newTextNode, nextSibling)
      } else {
        if (text) {
          startsParagraph && !i && quote && (quote += '\n')
          quote += text
        }

        const newHighlightSpan = document.createElement('span')
        newHighlightSpan.className = highlightClassname

        if (withNote) {
          newHighlightSpan.className = `${newHighlightSpan.className} ${highlightWithNoteClassName}`
        }

        if (customColor) {
          newHighlightSpan.className = `${newHighlightSpan.className} highlight__${customColor}`
        }

        newHighlightSpan.setAttribute(highlightIdAttribute, id)
        tooltip && newHighlightSpan.setAttribute('title', tooltip)
        newHighlightSpan.appendChild(newTextNode)
        lastElement = newHighlightSpan
        return parentNode?.insertBefore(newHighlightSpan, nextSibling)
      }
    })
    startingTextNodeIndex++
  }
  if (withNote && lastElement) {
    const svg = noteImage(customColor)
    svg.setAttribute(highlightNoteIdAttribute, id)

    const ctr = document.createElement('span')
    ctr.className = 'highlight_note_button'
    ctr.appendChild(svg)
    ctr.setAttribute(highlightNoteIdAttribute, id)
    ctr.setAttribute('width', '14px')
    ctr.setAttribute('height', '14px')

    lastElement.appendChild(ctr)
  }
  // if (withLabels && lastElement) {
  //   const svg = labelsImage(customColor)
  //   svg.setAttribute(highlightLabelIdAttribute, id)

  //   const ctr = document.createElement('span')
  //   ctr.className = 'highlight_label_button'
  //   ctr.appendChild(svg)
  //   ctr.setAttribute(highlightLabelIdAttribute, id)
  //   ctr.setAttribute('width', '14px')
  //   ctr.setAttribute('height', '14px')

  //   lastElement.appendChild(ctr)
  // }

  return {
    prefix,
    suffix,
    quote,
    startLocation: highlightTextStart,
    endLocation: highlightTextEnd,
  }
}

/**
 * Given a text selection by user, annotate the article around the selection and
 * produce a {@link https://github.com/google/diff-match-patch | diff patch}
 *
 * The diff patch is used for identifying the selection/highlight location
 *
 * @param range text selection range
 * @returns diff patch
 */
export function generateDiffPatch(range: Range): string {
  const articleContentElement = document.getElementById(articleContainerId)
  if (!articleContentElement)
    throw new Error('Unable to find article content element')
  const beforeSelectionRange = new Range()
  const afterSelectionRange = new Range()
  const entireArticleRange = new Range()

  entireArticleRange.selectNode(articleContentElement)

  beforeSelectionRange.setStart(
    entireArticleRange.startContainer,
    entireArticleRange.startOffset
  )
  beforeSelectionRange.setEnd(range.startContainer, range.startOffset)

  afterSelectionRange.setStart(range.endContainer, range.endOffset)
  afterSelectionRange.setEnd(
    entireArticleRange.endContainer,
    entireArticleRange.endOffset
  )

  const textWithTags = `${beforeSelectionRange.toString()}<${highlightTag}>${range.toString()}</${highlightTag}>${afterSelectionRange.toString()}`

  const diffMatchPatch = new DiffMatchPatch()
  const patch = diffMatchPatch.patch_toText(
    diffMatchPatch.patch_make(entireArticleRange.toString(), textWithTags)
  )

  if (!patch) throw new Error('Invalid patch')
  return patch
}

/**
 * Retrieve starting and ending offsets to the highlight selection
 * @param range highlight selection
 * @returns starting offset and ending offset (non-inclusive)
 */
export function retrieveOffsetsForSelection(range: Range): [number, number] {
  const patch = generateDiffPatch(range)
  const { highlightTextStart, highlightTextEnd } =
    selectionOffsetsFromPatch(patch)
  return [highlightTextStart, highlightTextEnd]
}

const getArticleTextNodes = (
  articleContentRef?: RefObject<Element>
): ArticleTextContent => {
  const articleContentElement =
    articleContentRef?.current || document.getElementById(articleContainerId)
  if (!articleContentElement)
    throw new Error('Unable to find article content element')

  let textNodeStartingPoint = 0
  let articleText = ''
  let newParagraph = false
  const textNodes: TextNode[] = []

  const getTextNode = (element: ChildNode): void => {
    if (element.nodeType === Node.TEXT_NODE) {
      textNodes.push({
        startIndex: textNodeStartingPoint,
        node: element,
        startsParagraph: newParagraph,
      })
      textNodeStartingPoint += element.nodeValue?.length || 0
      articleText += element.nodeValue
      newParagraph = false
    } else {
      if (!nonParagraphTagsRegEx.test((element as Element).tagName))
        newParagraph = true

      element.childNodes.forEach(getTextNode)
    }
  }

  articleContentElement.childNodes.forEach(getTextNode)

  textNodes.push({
    startIndex: textNodeStartingPoint,
    node: document.createTextNode(''),
  })

  return { textNodes, articleText }
}

/**
 * Return the offsets to the selection/highlight
 *
 * @param patch {@link generateDiffPatch|diff patch} identifying a selection/highlight location
 * @returns
 * - highlightTextStart - The start of highlight, offset from the start of article by characters
 * - highlightTextEnd - The end of highlight (non-inclusive), offset from the start of article by characters
 * - matchingHighlightContent - the matched highlight
 */
const selectionOffsetsFromPatch = (
  patch: string
): {
  highlightTextStart: number
  highlightTextEnd: number
  matchingHighlightContent: RegExpExecArray
} => {
  if (!patch) throw new Error('Invalid patch')
  const { articleText } = getArticleTextNodes()
  const dmp = new DiffMatchPatch()
  // Applying a patch to the whole article text to find the selection content via regexp
  const appliedPatch = dmp.patch_apply(dmp.patch_fromText(patch), articleText)
  let matchingHighlightContent
  if (!appliedPatch[1][0]) {
    dmp.Match_Threshold = maxDeepPatchThreshhold
    dmp.Match_Distance = maxDeepPatchDistance
    const deeperAppliedPatch = dmp.patch_apply(
      dmp.patch_fromText(patch),
      articleText
    )
    if (!deeperAppliedPatch[1][0]) {
      throw new Error('Unable to find the highlight')
    } else {
      matchingHighlightContent = highlightContentRegex.exec(
        deeperAppliedPatch[0]
      )
    }
  } else {
    matchingHighlightContent = highlightContentRegex.exec(appliedPatch[0])
  }

  if (!matchingHighlightContent)
    throw new Error('Unable to find the highlight from patch')

  const highlightTextStart = matchingHighlightContent.index
  const highlightTextEnd =
    highlightTextStart + matchingHighlightContent[1].length
  return {
    highlightTextStart,
    highlightTextEnd,
    matchingHighlightContent,
  }
}

export function getPrefixAndSuffix({ patch }: { patch: string }): {
  prefix: string
  suffix: string
  highlightTextStart: number
  highlightTextEnd: number
  textNodes: TextNode[]
  textNodeIndex: number
} {
  if (!patch) throw new Error('Invalid patch')
  const { textNodes } = getArticleTextNodes()

  const { highlightTextStart, highlightTextEnd } =
    selectionOffsetsFromPatch(patch)
  // Searching for the starting text node using interpolation search algorithm
  const textNodeIndex = interpolationSearch(
    textNodes.map(({ startIndex: startIndex }) => startIndex),
    highlightTextStart
  )
  const endTextNodeIndex = interpolationSearch(
    textNodes.map(({ startIndex: startIndex }) => startIndex),
    highlightTextEnd
  )

  const prefix = getSurroundingText({
    textNodes,
    startingTextNodeIndex: textNodeIndex,
    startingOffset: highlightTextStart - textNodes[textNodeIndex].startIndex,
    side: 'prefix',
  })
  const suffix = getSurroundingText({
    textNodes,
    startingTextNodeIndex: endTextNodeIndex,
    startingOffset: highlightTextEnd - textNodes[endTextNodeIndex].startIndex,
    side: 'suffix',
  })
  return {
    prefix,
    suffix,
    highlightTextStart,
    highlightTextEnd,
    textNodes,
    textNodeIndex,
  }
}

type FillNodeResponse = {
  node: Node
  textPartsToHighlight: {
    text: string
    highlight: boolean
  }[]
  startsParagraph?: boolean
}

const fillHighlight = ({
  textNodes,
  startingTextNodeIndex,
  highlightTextStart,
  highlightTextEnd,
}: {
  textNodes: TextNode[]
  startingTextNodeIndex: number
  highlightTextStart: number
  highlightTextEnd: number
}): FillNodeResponse => {
  const {
    node,
    startIndex: startIndex,
    startsParagraph,
  } = textNodes[startingTextNodeIndex]
  const text = node.nodeValue || ''

  const textBeforeHighlightLenght = highlightTextStart - startIndex
  const textAfterHighlightLenght = highlightTextEnd - startIndex

  const textPartsToHighlight = []
  textBeforeHighlightLenght > 0 &&
    textPartsToHighlight.push({
      text: text.substring(0, textBeforeHighlightLenght),
      highlight: false,
    })
  textPartsToHighlight.push({
    text: text.substring(textBeforeHighlightLenght, textAfterHighlightLenght),
    highlight: true,
  })
  textAfterHighlightLenght <= text.length &&
    textPartsToHighlight.push({
      text: text.substring(textAfterHighlightLenght),
      highlight: false,
    })
  return {
    node,
    textPartsToHighlight,
    startsParagraph,
  }
}

export const getHighlightElements = (highlightId: string): Element[] =>
  Array.from(
    document.querySelectorAll(`[${highlightIdAttribute}='${highlightId}']`)
  )

/**
 * Gets the part of text from the starting point to the paragraph ending from the
 * specified side
 * @param param0 - Object that includes textNodes array, starting point and the
 * way of movement (prefix, suffix)
 * @returns String of text to fulfill the paragraph that surrounds the
 * highlight from either starting or ending point
 */
const getSurroundingText = ({
  textNodes,
  startingTextNodeIndex,
  startingOffset,
  side,
}: {
  textNodes: TextNode[]
  startingTextNodeIndex: number
  startingOffset: number
  side: 'prefix' | 'suffix'
}): string => {
  const isPrefix = side === 'prefix'
  let i = startingTextNodeIndex
  const getTextPart = (): string => {
    i += isPrefix ? -1 : 1
    const { node, startsParagraph } = textNodes[i]
    const text = node.nodeValue || ''

    if (isPrefix) {
      if (startsParagraph) return text
      if (text.length > maxSurroundingTextLength) return text
      return getTextPart() + text
    } else {
      if (!textNodes[i + 1] || textNodes[i + 1].startsParagraph) return text
      if (text.length > maxSurroundingTextLength) return text
      return text + getTextPart()
    }
  }
  const truncateText = (str: string): string => {
    if (str.length <= maxSurroundingTextLength) return str
    if (isPrefix) {
      return str.slice(str.length - maxSurroundingTextLength)
    }
    return str.substring(0, maxSurroundingTextLength)
  }

  const { startsParagraph, node } = textNodes[startingTextNodeIndex]
  const nodeText = node.nodeValue || ''

  const text = isPrefix
    ? nodeText.substring(0, startingOffset)
    : nodeText.substring(startingOffset)

  if (isPrefix) {
    return truncateText(startsParagraph ? text : getTextPart() + text)
  } else {
    return truncateText(
      !textNodes[i + 1] || textNodes[i + 1].startsParagraph
        ? text
        : text + getTextPart()
    )
  }
}

export const isValidLength = (patch: string): boolean => {
  const { highlightTextStart, highlightTextEnd } = getPrefixAndSuffix({ patch })
  return highlightTextEnd - highlightTextStart < maxHighlightLength
}
