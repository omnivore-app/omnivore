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
import type { Highlight } from '../networking/fragments/highlightFragment'
import { removeHighlights } from './deleteHighlight'
import { ArticleMutations } from '../articleActions'

type CreateHighlightInput = {
  selection: SelectionAttributes
  articleId: string
  annotation?: string
  existingHighlights: Highlight[]
  highlightStartEndOffsets: HighlightLocation[]
}

type CreateHighlightOutput = {
  highlights?: Highlight[]
  errorMessage?: string
  newHighlightIndex?: number
}

export async function createHighlight(
  input: CreateHighlightInput,
  articleMutations: ArticleMutations
): Promise<CreateHighlightOutput> {
  if (!input.selection.selection) {
    return {}
  }

  const shouldMerge = input.selection.overlapHighlights.length > 0

  const { range, selection } = input.selection

  extendRangeToWordBoundaries(range)

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
    annotations.length > 0
  )

  const newHighlightAttributes = {
    prefix: highlightAttributes.prefix,
    suffix: highlightAttributes.suffix,
    quote: highlightAttributes.quote,
    id,
    shortId: nanoid(8),
    patch,
    annotation: annotations.length > 0 ? annotations.join('\n') : undefined,
    articleId: input.articleId,
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
