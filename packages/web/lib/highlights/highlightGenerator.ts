import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch'
import { RefObject } from 'react'
import type { Highlight } from '../networking/fragments/highlightFragment'
import { interpolationSearch } from './interpolationSearch'
import { highlightIdAttribute, highlightNoteIdAttribute } from './highlightHelpers'

const highlightTag = 'omnivore_highlight'
const highlightClassname = 'highlight'
const highlightWithNoteClassName = 'highlight_with_note'
const articleContainerId = 'article-container'
export const maxHighlightLength = 2000

const nonParagraphTagsRegEx = /^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u|code|mark)$/i
const highlightContentRegex = new RegExp(
  `<${highlightTag}>([\\s\\S]*)<\\/${highlightTag}>`,
  'i'
)
const maxDeepPatchDistance = 4000
const maxDeepPatchThreshhold = 0.5
const maxSurroundingTextLength = 2000

type TextNode = {
  startIndex: number
  node: Node
  startsParagraph?: boolean // TODO: rename to isParagraphStart?
}

type ArticleTextContent = {
  textNodes: TextNode[]
  articleText: string
}

export type HighlightLocation = {
  id: string
  start: number
  end: number
}

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
  const {
    startLocation: highlightTextStart,
    endLocation: highlightTextEnd,
  } = nodeAttributesFromHighlight(highlight)
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
  const customColor = !highlight.createdByMe
    ? stringToColour(highlight.user.profile.username)
    : undefined
  const tooltip = !highlight.createdByMe
    ? `Created by: @${highlight.user.profile.username}`
    : undefined

  return makeHighlightNodeAttributes(patch, id, withNote, customColor, tooltip)
}

export function makeHighlightNodeAttributes(
  patch: string,
  id: string,
  withNote: boolean,
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

    parentNode?.removeChild(node)
    textPartsToHighlight.forEach(({ highlight, text: rawText }, i) => {
      // Prevent hardcoded \n, we'll create new-lines based on the startsParagraph data
      const text = rawText.replace(/\n/g, '')
      const newTextNode = document.createTextNode(text)

      if (!highlight) {
        return parentNode?.insertBefore(newTextNode, nextSibling)
      } else {
        if (text) {
          startsParagraph && !i && quote && (quote += '\n')
          quote += text
        }

        const newHighlightSpan = document.createElement('span')
        newHighlightSpan.className = withNote ? highlightWithNoteClassName : highlightClassname
        newHighlightSpan.setAttribute(highlightIdAttribute, id)
        customColor &&
          newHighlightSpan.setAttribute(
            'style',
            `background-color: ${customColor} !important`
          )
        tooltip && newHighlightSpan.setAttribute('title', tooltip)
        newHighlightSpan.appendChild(newTextNode)
        lastElement = newHighlightSpan
        return parentNode?.insertBefore(newHighlightSpan, nextSibling)
      }
    })
    startingTextNodeIndex++
  }
  if (withNote && lastElement) {
    lastElement.classList.add('last_element')
    const button = document.createElement('img')
    button.className = 'highlight_note_button'
    button.src = '/static/icons/highlight-note-icon.svg'
    button.alt = 'Add note'
    button.setAttribute(highlightNoteIdAttribute, id)

    lastElement.appendChild(button)
  }

  return {
    prefix,
    suffix,
    quote,
    startLocation: highlightTextStart,
    endLocation: highlightTextEnd,
  }
}

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

export function wrapHighlightTagAroundRange(range: Range): [number, number] {
  const patch = generateDiffPatch(range)
  const { highlightTextStart, highlightTextEnd } = selectionOffsetsFromPatch(
    patch
  )
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

export function getPrefixAndSuffix({
  patch,
}: {
  patch: string
}): {
  prefix: string
  suffix: string
  highlightTextStart: number
  highlightTextEnd: number
  textNodes: TextNode[]
  textNodeIndex: number
} {
  if (!patch) throw new Error('Invalid patch')
  const { textNodes } = getArticleTextNodes()

  const { highlightTextStart, highlightTextEnd } = selectionOffsetsFromPatch(
    patch
  )
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
  const { node, startIndex: startIndex, startsParagraph } = textNodes[
    startingTextNodeIndex
  ]
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

function stringToColour(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += ('00' + value.toString(16)).substr(-2)
  }
  return colour
}

export const isValidLength = (patch: string): boolean => {
  const { highlightTextStart, highlightTextEnd } = getPrefixAndSuffix({ patch })
  return highlightTextEnd - highlightTextStart < maxHighlightLength
}
