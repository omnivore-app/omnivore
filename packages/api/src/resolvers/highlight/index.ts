/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { authorized } from '../../utils/helpers'
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
import { env } from '../../env'
import { analytics } from '../../utils/analytics'
import { Highlight as HighlightData } from '../../elastic/types'
import { getPageById, updatePage } from '../../elastic/pages'
import {
  addHighlightToPage,
  deleteHighlight,
  getHighlightById,
  updateHighlight,
} from '../../elastic/highlights'

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

  analytics.track({
    userId: claims.uid,
    event: 'highlight_created',
    properties: {
      pageId,
      env: env.server.apiEnv,
    },
  })

  if (input.annotation && input.annotation.length > 4000) {
    return {
      errorCodes: [CreateHighlightErrorCode.BadData],
    }
  }

  try {
    const highlight: HighlightData = {
      updatedAt: new Date(),
      createdAt: new Date(),
      userId: claims.uid,
      ...input,
    }

    if (
      !(await addHighlightToPage(pageId, highlight, {
        pubsub,
        uid: claims.uid,
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

  const articleHighlights = page.highlights

  /* Compute merged annotation form the order of highlights appearing on page */
  const overlapAnnotations: { [id: string]: string } = {}
  articleHighlights.forEach((highlight, index) => {
    if (overlapHighlightIdList.includes(highlight.id)) {
      articleHighlights.splice(index, 1)

      if (highlight.annotation) {
        overlapAnnotations[highlight.id] = highlight.annotation
      }
    }
  })
  const mergedAnnotation: string[] = []
  overlapHighlightIdList.forEach((highlightId) => {
    if (overlapAnnotations[highlightId]) {
      mergedAnnotation.push(overlapAnnotations[highlightId])
    }
  })

  try {
    const highlight: HighlightData = {
      ...newHighlightInput,
      updatedAt: new Date(),
      createdAt: new Date(),
      userId: claims.uid,
      annotation: mergedAnnotation ? mergedAnnotation.join('\n') : null,
    }

    const merged = await updatePage(
      pageId,
      { highlights: articleHighlights.concat(highlight) },
      { pubsub, uid: claims.uid }
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
  const { highlightId } = input
  const highlight = await getHighlightById(highlightId)

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

  if (input.annotation && input.annotation.length > 4000) {
    return {
      errorCodes: [UpdateHighlightErrorCode.BadData],
    }
  }

  const updatedHighlight: HighlightData = {
    ...highlight,
    annotation: input.annotation,
    updatedAt: new Date(),
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
  })

  if (!updated) {
    return {
      errorCodes: [SetShareHighlightErrorCode.NotFound],
    }
  }

  return { highlight: highlightDataToHighlight(updatedHighlight) }
})
