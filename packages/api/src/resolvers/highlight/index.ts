/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { DeepPartial } from 'typeorm'
import {
  Highlight as HighlightEntity,
  HighlightType,
  RepresentationType,
} from '../../entity/highlight'
import { Label } from '../../entity/label'
import { env } from '../../env'
import {
  CreateHighlightError,
  CreateHighlightErrorCode,
  CreateHighlightSuccess,
  DeleteHighlightError,
  DeleteHighlightErrorCode,
  DeleteHighlightSuccess,
  HighlightEdge,
  HighlightsError,
  HighlightsErrorCode,
  HighlightsSuccess,
  MergeHighlightError,
  MergeHighlightErrorCode,
  MergeHighlightSuccess,
  MutationCreateHighlightArgs,
  MutationDeleteHighlightArgs,
  MutationMergeHighlightArgs,
  MutationUpdateHighlightArgs,
  QueryHighlightsArgs,
  UpdateHighlightError,
  UpdateHighlightErrorCode,
  UpdateHighlightSuccess,
} from '../../generated/graphql'
import { highlightRepository } from '../../repository/highlight'
import {
  createHighlight,
  deleteHighlightById,
  mergeHighlights,
  searchHighlights,
  updateHighlight,
} from '../../services/highlights'
import { Merge } from '../../util'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'

export const createHighlightResolver = authorized<
  Merge<CreateHighlightSuccess, { highlight: HighlightEntity }>,
  CreateHighlightError,
  MutationCreateHighlightArgs
>(async (_, { input }, { log, pubsub, uid }) => {
  try {
    const newHighlight = await createHighlight(
      {
        ...input,
        user: { id: uid },
        libraryItem: { id: input.articleId },
        highlightType: input.type || HighlightType.Highlight,
        highlightPositionAnchorIndex: input.highlightPositionAnchorIndex || 0,
        highlightPositionPercent: input.highlightPositionPercent || 0,
        representation: input.representation || RepresentationType.Content,
      },
      input.articleId,
      uid,
      pubsub
    )

    analytics.capture({
      distinctId: uid,
      event: 'highlight_created',
      properties: {
        libraryItemId: input.articleId,
        env: env.server.apiEnv,
      },
    })

    return { highlight: newHighlight }
  } catch (err) {
    log.error('Error creating highlight', err)
    return {
      errorCodes: [CreateHighlightErrorCode.Forbidden],
    }
  }
})

export const mergeHighlightResolver = authorized<
  Merge<MergeHighlightSuccess, { highlight: HighlightEntity }>,
  MergeHighlightError,
  MutationMergeHighlightArgs
>(async (_, { input }, { authTrx, log, pubsub, uid }) => {
  const { overlapHighlightIdList, ...newHighlightInput } = input

  /* Compute merged annotation form the order of highlights appearing on page */
  const mergedAnnotations: string[] = []
  const mergedLabels: Label[] = []
  const mergedColors: string[] = []

  try {
    const existingHighlights = await authTrx((tx) =>
      tx
        .withRepository(highlightRepository)
        .findByLibraryItemId(input.articleId, uid)
    )

    existingHighlights.forEach((highlight) => {
      // filter out highlights that are in the overlap list
      // and are of type highlight (not annotation or note)
      if (
        overlapHighlightIdList.includes(highlight.id) &&
        highlight.highlightType === HighlightType.Highlight
      ) {
        highlight.annotation && mergedAnnotations.push(highlight.annotation)

        if (highlight.labels) {
          // remove duplicates from labels by checking id
          highlight.labels.forEach((label) => {
            if (
              !mergedLabels.find((mergedLabel) => mergedLabel.id === label.id)
            ) {
              mergedLabels.push(label)
            }
          })
        }
        // collect colors of overlap highlights
        highlight.color && mergedColors.push(highlight.color)
      }
    })
    // use new color or the color of the last overlap highlight
    const color =
      newHighlightInput.color || mergedColors[mergedColors.length - 1]

    const highlight: DeepPartial<HighlightEntity> = {
      ...newHighlightInput,
      annotation:
        mergedAnnotations.length > 0 ? mergedAnnotations.join('\n') : null,
      color,
      user: { id: uid },
      libraryItem: { id: input.articleId },
      highlightPositionAnchorIndex: input.highlightPositionAnchorIndex || 0,
      highlightPositionPercent: input.highlightPositionPercent || 0,
      representation: input.representation || RepresentationType.Content,
    }

    const newHighlight = await mergeHighlights(
      overlapHighlightIdList,
      highlight,
      mergedLabels,
      input.articleId,
      uid,
      pubsub
    )

    analytics.capture({
      distinctId: uid,
      event: 'highlight_created',
      properties: {
        libraryItemId: input.articleId,
        env: env.server.apiEnv,
      },
    })

    return {
      highlight: newHighlight,
      overlapHighlightIdList: input.overlapHighlightIdList,
    }
  } catch (e) {
    log.error('Error merging highlight', e)
    return {
      errorCodes: [MergeHighlightErrorCode.Forbidden],
    }
  }
})

export const updateHighlightResolver = authorized<
  Merge<UpdateHighlightSuccess, { highlight: HighlightEntity }>,
  UpdateHighlightError,
  MutationUpdateHighlightArgs
>(async (_, { input }, { pubsub, uid, log }) => {
  try {
    const updatedHighlight = await updateHighlight(
      input.highlightId,
      {
        annotation: input.annotation,
        html: input.html,
        quote: input.quote,
        color: input.color,
      },
      uid,
      pubsub
    )

    return { highlight: updatedHighlight }
  } catch (error) {
    log.error('updateHighlightResolver error', error)
    return {
      errorCodes: [UpdateHighlightErrorCode.Forbidden],
    }
  }
})

export const deleteHighlightResolver = authorized<
  Merge<DeleteHighlightSuccess, { highlight: HighlightEntity }>,
  DeleteHighlightError,
  MutationDeleteHighlightArgs
>(async (_, { highlightId }, { log }) => {
  try {
    const deletedHighlight = await deleteHighlightById(highlightId)

    if (!deletedHighlight) {
      return {
        errorCodes: [DeleteHighlightErrorCode.NotFound],
      }
    }

    return { highlight: deletedHighlight }
  } catch (error) {
    log.error('deleteHighlightResolver error', error)
    return {
      errorCodes: [DeleteHighlightErrorCode.Forbidden],
    }
  }
})

type PartialHighlightEdge = Merge<
  HighlightEdge,
  {
    node: HighlightEntity
  }
>
type PartialHighlightsSuccess = Merge<
  HighlightsSuccess,
  {
    edges: PartialHighlightEdge[]
  }
>
export const highlightsResolver = authorized<
  PartialHighlightsSuccess,
  HighlightsError,
  QueryHighlightsArgs
>(async (_, { after, first, query }, { uid, log }) => {
  const limit = first || 10
  const offset = parseInt(after || '0')
  if (
    isNaN(offset) ||
    offset < 0 ||
    limit > 50 ||
    (query?.length && query.length > 1000)
  ) {
    log.error('Invalid args', { after, first, query })

    return {
      errorCodes: [HighlightsErrorCode.BadRequest],
    }
  }

  const highlights = await searchHighlights(
    uid,
    query || undefined,
    limit + 1,
    offset
  )

  const hasNextPage = highlights.length > limit
  if (hasNextPage) {
    highlights.pop()
  }
  const endCursor = String(offset + highlights.length)

  const edges = highlights.map((highlight) => ({
    cursor: endCursor,
    node: highlight,
  }))

  return {
    edges,
    pageInfo: {
      startCursor: String(offset),
      endCursor,
      hasPreviousPage: offset > 0,
      hasNextPage,
    },
  }
})
