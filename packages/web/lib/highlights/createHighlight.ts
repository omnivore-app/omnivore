import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import type { SelectionAttributes } from './highlightHelpers'
import {
  generateDiffPatch,
  isValidLength,
  makeHighlightNodeAttributes,
} from './highlightGenerator'
import type { HighlightLocation } from './highlightGenerator'
import { extendRangeToWordBoundaries } from './normalizeHighlightRange'
import type {
  Highlight,
  HighlightType,
} from '../networking/fragments/highlightFragment'
import { removeHighlights } from './deleteHighlight'
import { ArticleMutations } from '../articleActions'
import { NodeHtmlMarkdown } from 'node-html-markdown'

type CreateHighlightInput = {
  selection: SelectionAttributes
  articleId: string
  annotation?: string
  color?: string
  existingHighlights: Highlight[]
  highlightStartEndOffsets: HighlightLocation[]
  highlightPositionPercent?: number
  highlightPositionAnchorIndex?: number
}

type CreateHighlightOutput = {
  highlights?: Highlight[]
  errorMessage?: string
  newHighlightIndex?: number
}

/* ********************************************************* *
 * Re-use
 * If using it several times, creating an instance saves time
 * ********************************************************* */
const nhm = new NodeHtmlMarkdown(
  /* options (optional) */ {},
  /* customTransformers (optional) */ undefined,
  /* customCodeBlockTranslators (optional) */ undefined
)

export const htmlToMarkdown = (html: string) => {
  return nhm.translate(/* html */ html)
}

export async function createHighlight(
  input: CreateHighlightInput,
  articleMutations: ArticleMutations
): Promise<CreateHighlightOutput> {
  if (!input.selection.selection) {
    return {}
  }
  console.log(' overlapping: ', input.selection.overlapHighlights)
  const shouldMerge = input.selection.overlapHighlights.length > 0

  const { range, selection } = input.selection

  extendRangeToWordBoundaries(range)

  // Create a temp container for copying the range HTML
  const container = document.createElement('div')
  container.appendChild(range.cloneContents())

  const id = uuidv4()
  const patch = generateDiffPatch(range)

  if (!isValidLength(patch)) {
    return { errorMessage: 'Highlight is too long' }
  }

  if (!selection.isCollapsed) {
    selection.collapseToStart()
  }

  const annotations: string[] = []
  if (input.annotation) {
    annotations.push(input.annotation)
  }

  if (shouldMerge) {
    input.selection.overlapHighlights.forEach((id) => {
      const highlight = input.existingHighlights.find(($0) => $0.id === id)
      const annotation = highlight?.annotation
      if (annotation) {
        annotations.push(annotation)
      }
    })
    removeHighlights(
      input.selection.overlapHighlights,
      input.highlightStartEndOffsets
    )
  }

  const highlightAttributes = makeHighlightNodeAttributes(
    patch,
    id,
    annotations.length > 0,
    false,
    input.color
  )

  const newHighlightAttributes = {
    id,
    shortId: nanoid(8),
    patch,
    type: 'HIGHLIGHT' as HighlightType,

    color: input.color,
    prefix: highlightAttributes.prefix,
    suffix: highlightAttributes.suffix,
    quote: htmlToMarkdown(container.innerHTML),
    html: container.innerHTML,

    annotation: annotations.length > 0 ? annotations.join('\n') : undefined,
    articleId: input.articleId,
    highlightPositionPercent: input.highlightPositionPercent,
    highlightPositionAnchorIndex: input.highlightPositionAnchorIndex,
  }

  let highlight: Highlight | undefined
  let keptHighlights = input.existingHighlights

  if (shouldMerge) {
    highlight = await articleMutations.mergeHighlightMutation({
      ...newHighlightAttributes,
      overlapHighlightIdList: input.selection.overlapHighlights,
    })

    keptHighlights = input.existingHighlights.filter(
      ($0) => !input.selection.overlapHighlights.includes($0.id)
    )
  } else {
    highlight = await articleMutations.createHighlightMutation(
      newHighlightAttributes
    )
  }

  document.dispatchEvent(new Event('highlightsUpdated'))

  if (highlight) {
    const highlights = [...keptHighlights, highlight]
    return {
      highlights,
      newHighlightIndex:
        highlights.length > 0 ? highlights.length - 1 : undefined,
    }
  } else {
    return {
      highlights: input.existingHighlights,
      errorMessage: 'Could not create highlight',
    }
  }
}
