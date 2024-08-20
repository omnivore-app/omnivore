import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch'
import { parseHTML } from 'linkedom'
import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid'
import { interpolationSearch } from './interpolationSearch'
import { logger } from './logger'

const highlightTag = 'omnivore_highlight'
export const maxHighlightLength = 2000
export const highlightIdAttribute = 'omnivore-highlight-id'

const nonParagraphTagsRegEx =
  /^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u|code|mark)$/i
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
  isParagraphStart?: boolean
}

type ArticleTextContent = {
  textNodes: TextNode[]
  articleText: string
}

export type EmbeddedHighlightData = {
  prefix: string
  suffix: string
  quote: string
  id: string
  shortId: string
  patch: string
}

type FillNodeResponse = {
  node: Node
  textPartsToHighlight: {
    text: string
    highlight: boolean
  }[]
  isParagraphStart?: boolean
}

function getTextNodesBetween(rootNode: Node, startNode: Node, endNode: Node) {
  let textNodeStartingPoint = 0
  let articleText = ''
  let newParagraph = false
  const textNodes: TextNode[] = []
  let pastStartNode = false,
    reachedEndNode = false

  function pushNode(node: Node) {
    textNodes.push({
      node,
      startIndex: textNodeStartingPoint,
      isParagraphStart: newParagraph,
    })
    textNodeStartingPoint += node.nodeValue?.length || 0
    articleText += node.nodeValue
    newParagraph = false
  }

  function getTextNodes(node: Node) {
    if (!node) return

    if (node == startNode) {
      pastStartNode = true
    }

    if (node.nodeType == 3) {
      if (
        pastStartNode &&
        !reachedEndNode &&
        !/^\s*$/.test(node.nodeValue || '')
      ) {
        pushNode(node)
      }
    } else {
      if (!nonParagraphTagsRegEx.test((node as Element).tagName))
        newParagraph = true
    }

    for (
      let i = 0, len = node.childNodes.length;
      !reachedEndNode && i < len;
      ++i
    ) {
      getTextNodes(node.childNodes[i])
    }

    if (node == endNode) {
      reachedEndNode = true
    }
  }

  getTextNodes(rootNode)

  return {
    textNodes,
    articleText,
  }
}

export const findEmbeddedHighlight = (
  dom: Element
): EmbeddedHighlightData | undefined => {
  const startNode = dom.querySelector(
    'span[data-omnivore-highlight-start="true"]'
  )
  const endNode = dom.querySelector('span[data-omnivore-highlight-end="true"]')

  const articleContentElement = dom
  if (!articleContentElement || !startNode || !endNode) {
    return undefined
  }

  try {
    const beforeNodes = getTextNodesBetween(
      dom,
      articleContentElement,
      startNode
    )
    const highlightNodes = getTextNodesBetween(dom, startNode, endNode)
    const afterNodes = getTextNodesBetween(dom, endNode, articleContentElement)
    const allArticleNodes = getTextNodesBetween(
      dom,
      articleContentElement,
      articleContentElement
    )

    const patch = generateDiffPatch(
      allArticleNodes,
      beforeNodes,
      highlightNodes,
      afterNodes
    )

    const id = uuidv4()
    const shortId = nanoid(8)
    const info = getPrefixAndSuffix(allArticleNodes, patch)
    const quote = getQuoteText(highlightNodes)

    return {
      id,
      shortId,
      quote,
      patch,
      prefix: info.prefix,
      suffix: info.suffix,
    }
  } catch (error) {
    logger.error(error)
    return undefined
  }
}

const getQuoteText = (highlight: ArticleTextContent): string => {
  let quote = ''

  highlight.textNodes.forEach((textNode, i) => {
    if (textNode.isParagraphStart && i > 0) {
      quote += '\n'
    }
    quote += textNode.node.textContent
  })

  return quote
}

function generateDiffPatch(
  allArticleNodes: ArticleTextContent,
  beforeNodes: ArticleTextContent,
  highlightNodes: ArticleTextContent,
  afterNodes: ArticleTextContent
): string {
  const textWithTags = `${beforeNodes.articleText}<${highlightTag}>${highlightNodes.articleText}</${highlightTag}>${afterNodes.articleText}`
  const diffMatchPatch = new DiffMatchPatch()
  const patch = diffMatchPatch.patch_toText(
    diffMatchPatch.patch_make(allArticleNodes.articleText, textWithTags)
  )

  if (!patch) throw new Error('Invalid patch')
  return patch
}

function getPrefixAndSuffix(
  articleTextNodes: ArticleTextContent,
  patch: string
): {
  prefix: string
  suffix: string
  highlightTextStart: number
  highlightTextEnd: number
  textNodes: TextNode[]
  textNodeIndex: number
} {
  if (!patch) throw new Error('Invalid patch')
  const textNodes = articleTextNodes.textNodes

  const { highlightTextStart, highlightTextEnd } = selectionOffsetsFromPatch(
    articleTextNodes.articleText,
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
    const { node, isParagraphStart: startsParagraph } = textNodes[i]
    const text = node.nodeValue || ''

    if (isPrefix) {
      if (startsParagraph) return text
      if (text.length > maxSurroundingTextLength) return text
      return getTextPart() + text
    } else {
      if (!textNodes[i + 1] || textNodes[i + 1].isParagraphStart) return text
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

  const { isParagraphStart: startsParagraph, node } =
    textNodes[startingTextNodeIndex]
  const nodeText = node.nodeValue || ''

  const text = isPrefix
    ? nodeText.substring(0, startingOffset)
    : nodeText.substring(startingOffset)

  if (isPrefix) {
    return truncateText(startsParagraph ? text : getTextPart() + text)
  } else {
    return truncateText(
      !textNodes[i + 1] || textNodes[i + 1].isParagraphStart
        ? text
        : text + getTextPart()
    )
  }
}

const selectionOffsetsFromPatch = (
  articleText: string,
  patch: string
): {
  highlightTextStart: number
  highlightTextEnd: number
  matchingHighlightContent: RegExpExecArray
} => {
  if (!patch) throw new Error('Invalid patch')
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
    isParagraphStart,
  } = textNodes[startingTextNodeIndex]
  const text = node.nodeValue || ''

  const textBeforeHighlightLength = highlightTextStart - startIndex
  const textAfterHighlightLength = highlightTextEnd - startIndex

  const textPartsToHighlight = []
  textBeforeHighlightLength > 0 &&
    textPartsToHighlight.push({
      text: text.substring(0, textBeforeHighlightLength),
      highlight: false,
    })
  textPartsToHighlight.push({
    text: text.substring(textBeforeHighlightLength, textAfterHighlightLength),
    highlight: true,
  })
  textAfterHighlightLength <= text.length &&
    textPartsToHighlight.push({
      text: text.substring(textAfterHighlightLength),
      highlight: false,
    })
  return {
    node,
    textPartsToHighlight,
    isParagraphStart,
  }
}

export function getArticleTextNodes(
  document: Document
): ArticleTextContent | null {
  try {
    const rootNode = document.getRootNode()
    return getTextNodesBetween(rootNode, rootNode, rootNode)
  } catch (error) {
    logger.error(error)
    return null
  }
}

export function makeHighlightNodeAttributes(
  id: string,
  patch: string,
  articleTextNodes: ArticleTextContent
) {
  const document = parseHTML('').document
  const textNodes = articleTextNodes.textNodes
  const { highlightTextStart, highlightTextEnd } = selectionOffsetsFromPatch(
    articleTextNodes.articleText,
    patch
  )

  // Searching for the starting text node using interpolation search algorithm
  let startingTextNodeIndex = interpolationSearch(
    textNodes.map(({ startIndex: startIndex }) => startIndex),
    highlightTextStart
  )
  let quote = ''

  while (
    startingTextNodeIndex < textNodes.length &&
    highlightTextEnd > textNodes[startingTextNodeIndex].startIndex
  ) {
    const { node, textPartsToHighlight, isParagraphStart } = fillHighlight({
      textNodes,
      startingTextNodeIndex,
      highlightTextStart,
      highlightTextEnd,
    })
    const { parentNode, nextSibling } = node

    // check if the node is a <pre> tag
    const isPre = node.parentElement?.tagName === 'PRE'

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
          isParagraphStart && !i && quote && (quote += '\n')
          quote += text
        }

        const newHighlightSpan = document.createElement('span')
        newHighlightSpan.setAttribute(highlightIdAttribute, id)
        newHighlightSpan.appendChild(newTextNode)
        return parentNode?.insertBefore(newHighlightSpan, nextSibling)
      }
    })
    startingTextNodeIndex++
  }
}
