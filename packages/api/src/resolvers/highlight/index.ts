/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  addHighlightToPage,
  deleteHighlight,
  getHighlightById,
  updateHighlight,
} from '../../elastic/highlights'
import { getPageById, updatePage } from '../../elastic/pages'
import {
  Highlight as HighlightData,
  HighlightType,
  Label,
} from '../../elastic/types'
import { env } from '../../env'
import {
  CreateHighlightError,
  CreateHighlightErrorCode,
  CreateHighlightSuccess,
  DeleteHighlightError,
  DeleteHighlightErrorCode,
  DeleteHighlightSuccess,
  Highlight,
  MergeHighlightError,
  MergeHighlightErrorCode,
  MergeHighlightSuccess,
  MutationCreateHighlightArgs,
  MutationDeleteHighlightArgs,
  MutationMergeHighlightArgs,
  MutationSetShareHighlightArgs,
  MutationUpdateHighlightArgs,
  SetShareHighlightError,
  SetShareHighlightErrorCode,
  SetShareHighlightSuccess,
  UpdateHighlightError,
  UpdateHighlightErrorCode,
  UpdateHighlightSuccess,
  User,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { authorized, unescapeHtml } from '../../utils/helpers'

const highlightDataToHighlight = (highlight: HighlightData): Highlight => ({
  ...highlight,
  user: highlight.userId as unknown as User,
  updatedAt: highlight.updatedAt || highlight.createdAt,
  replies: [],
  reactions: [],
  createdByMe: undefined as never,
})

export const createHighlightResolver = authorized<
  CreateHighlightSuccess,
  CreateHighlightError,
  MutationCreateHighlightArgs
>(async (_, { input }, { claims, log, pubsub }) => {
  const { articleId: pageId } = input
  const page = await getPageById(pageId)
  if (!page) {
    return {
      errorCodes: [CreateHighlightErrorCode.NotFound],
    }
  }
  if (page.userId !== claims.uid) {
    return {
      errorCodes: [CreateHighlightErrorCode.Unauthorized],
    }
  }
  if (input.annotation && input.annotation.length > 4000) {
    return {
      errorCodes: [CreateHighlightErrorCode.BadData],
    }
  }

  // unescape HTML entities
  const annotation = input.annotation
    ? unescapeHtml(input.annotation)
    : undefined

  try {
    const highlight: HighlightData = {
      ...input,
      updatedAt: new Date(),
      createdAt: new Date(),
      userId: claims.uid,
      annotation,
      type: input.type || HighlightType.Highlight,
    }

    if (
      !(await addHighlightToPage(pageId, highlight, {
        pubsub,
        uid: claims.uid,
        refresh: true,
      }))
    ) {
      return {
        errorCodes: [CreateHighlightErrorCode.NotFound],
      }
    }

    log.info('Creating a new highlight', {
      highlight,
      labels: {
        source: 'resolver',
        resolver: 'createHighlightResolver',
        uid: claims.uid,
      },
    })

    analytics.capture({
      distinctId: claims.uid,
      event: 'highlight_created',
      properties: {
        pageId,
        env: env.server.apiEnv,
      },
    })

    return { highlight: highlightDataToHighlight(highlight) }
  } catch (err) {
    log.error('Error creating highlight', err)
    return {
      errorCodes: [CreateHighlightErrorCode.AlreadyExists],
    }
  }
})

export const mergeHighlightResolver = authorized<
  MergeHighlightSuccess,
  MergeHighlightError,
  MutationMergeHighlightArgs
>(async (_, { input }, { claims, log, pubsub }) => {
  const { articleId: pageId } = input
  const { overlapHighlightIdList, ...newHighlightInput } = input
  const page = await getPageById(pageId)
  if (!page || !page.highlights) {
    return {
      errorCodes: [MergeHighlightErrorCode.NotFound],
    }
  }
  if (page.userId !== claims.uid) {
    return {
      errorCodes: [MergeHighlightErrorCode.Unauthorized],
    }
  }
  /* Compute merged annotation form the order of highlights appearing on page */
  const mergedAnnotations: string[] = []
  const mergedLabels: Label[] = []
  const mergedColors: string[] = []
  const pageHighlights = page.highlights.filter((highlight) => {
    // filter out highlights that are in the overlap list
    // and are of type highlight (not annotation or note)
    if (
      overlapHighlightIdList.includes(highlight.id) &&
      highlight.type === HighlightType.Highlight
    ) {
      if (highlight.annotation) {
        mergedAnnotations.push(highlight.annotation)
      }
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

      return false
    }
    return true
  })
  // use new color or the color of the last overlap highlight
  const color = newHighlightInput.color || mergedColors[mergedColors.length - 1]
  try {
    const highlight: HighlightData = {
      ...newHighlightInput,
      updatedAt: new Date(),
      createdAt: new Date(),
      userId: claims.uid,
      annotation:
        mergedAnnotations.length > 0 ? mergedAnnotations.join('\n') : null,
      type: HighlightType.Highlight,
      labels: mergedLabels,
      color,
    }

    const merged = await updatePage(
      pageId,
      { highlights: pageHighlights.concat(highlight) },
      { pubsub, uid: claims.uid, refresh: true }
    )
    if (!merged) {
      throw new Error('Failed to create merged highlight')
    }

    log.info('Creating a merged highlight', {
      highlight,
      labels: {
        source: 'resolver',
        resolver: 'mergeHighlightResolver',
        uid: claims.uid,
        pageId,
      },
    })

    return {
      highlight: highlightDataToHighlight(highlight),
      overlapHighlightIdList: input.overlapHighlightIdList,
    }
  } catch (e) {
    log.info('Failed to create a merged highlight', {
      error: e,
      labels: {
        source: 'resolver',
        resolver: 'mergeHighlightResolver',
        uid: claims.uid,
      },
    })

    return {
      errorCodes: [MergeHighlightErrorCode.AlreadyExists],
    }
  }
})

export const updateHighlightResolver = authorized<
  UpdateHighlightSuccess,
  UpdateHighlightError,
  MutationUpdateHighlightArgs
>(async (_, { input }, { pubsub, claims, log }) => {
  const highlight = await getHighlightById(input.highlightId)

  if (!highlight?.id) {
    return {
      errorCodes: [UpdateHighlightErrorCode.NotFound],
    }
  }

  if (highlight.userId !== claims.uid) {
    return {
      errorCodes: [UpdateHighlightErrorCode.Forbidden],
    }
  }

  // unescape HTML entities
  const annotation = input.annotation
    ? unescapeHtml(input.annotation)
    : undefined
  const quote = input.quote ? unescapeHtml(input.quote) : highlight.quote

  const updatedHighlight: HighlightData = {
    ...highlight,
    annotation,
    quote,
    updatedAt: new Date(),
    color: input.color,
  }

  log.info('Updating a highlight', {
    updatedHighlight,
    labels: {
      source: 'resolver',
      resolver: 'updateHighlightResolver',
      uid: claims.uid,
    },
  })

  const updated = await updateHighlight(updatedHighlight, {
    pubsub,
    uid: claims.uid,
    refresh: true,
  })

  if (!updated) {
    return {
      errorCodes: [UpdateHighlightErrorCode.NotFound],
    }
  }

  return { highlight: highlightDataToHighlight(updatedHighlight) }
})

export const deleteHighlightResolver = authorized<
  DeleteHighlightSuccess,
  DeleteHighlightError,
  MutationDeleteHighlightArgs
>(async (_, { highlightId }, { claims, log, pubsub }) => {
  const highlight = await getHighlightById(highlightId)

  if (!highlight?.id) {
    return {
      errorCodes: [DeleteHighlightErrorCode.NotFound],
    }
  }

  if (highlight.userId !== claims.uid) {
    return {
      errorCodes: [DeleteHighlightErrorCode.Forbidden],
    }
  }

  const deleted = await deleteHighlight(highlightId, {
    pubsub,
    uid: claims.uid,
    refresh: true,
  })

  if (!deleted) {
    return {
      errorCodes: [DeleteHighlightErrorCode.NotFound],
    }
  }

  log.info('Deleting a highlight', {
    highlight,
    labels: {
      source: 'resolver',
      resolver: 'deleteHighlightResolver',
      uid: claims.uid,
    },
  })

  return { highlight: highlightDataToHighlight(highlight) }
})

export const setShareHighlightResolver = authorized<
  SetShareHighlightSuccess,
  SetShareHighlightError,
  MutationSetShareHighlightArgs
>(async (_, { input: { id, share } }, { pubsub, claims, log }) => {
  const highlight = await getHighlightById(id)

  if (!highlight?.id) {
    return {
      errorCodes: [SetShareHighlightErrorCode.NotFound],
    }
  }

  if (highlight.userId !== claims.uid) {
    return {
      errorCodes: [SetShareHighlightErrorCode.Forbidden],
    }
  }

  const sharedAt = share ? new Date() : null

  log.info(`${share ? 'S' : 'Uns'}haring a highlight`, {
    highlight,
    labels: {
      source: 'resolver',
      resolver: 'setShareHighlightResolver',
      userId: highlight.userId,
    },
  })

  const updatedHighlight: HighlightData = {
    ...highlight,
    sharedAt,
    updatedAt: new Date(),
  }

  const updated = await updateHighlight(updatedHighlight, {
    pubsub,
    uid: claims.uid,
    refresh: true,
  })

  if (!updated) {
    return {
      errorCodes: [SetShareHighlightErrorCode.NotFound],
    }
  }

  return { highlight: highlightDataToHighlight(updatedHighlight) }
})
