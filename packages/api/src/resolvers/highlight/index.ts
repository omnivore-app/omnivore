/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { authorized } from '../../utils/helpers'
import {
  Article,
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
import { HighlightData } from '../../datalayer/highlight/model'
import axios from 'axios'
import { env } from '../../env'
import { DataModels } from '../types'
import { Logger } from 'winston'
import { analytics } from '../../utils/analytics'
import { getPageById, getPageByParam } from '../../elastic'

const highlightDataToHighlight = (highlight: HighlightData): Highlight => ({
  ...highlight,
  user: highlight.userId as unknown as User,
  article: highlight.articleId as unknown as Article,
  updatedAt: highlight.updatedAt || highlight.createdAt,
  replies: [],
  reactions: [],
  createdByMe: undefined as never,
})

const generateHighlightPreviewImage = (
  models: DataModels,
  highlight: HighlightData,
  log: Logger
): void => {
  Promise.all([
    models.user.get(highlight.userId),
    getPageByParam(highlight.userId, { _id: highlight.elasticPageId }),
  ]).then(async ([user, userArticle]) => {
    if (!userArticle) return

    const previewImageGenerationUrl = `${
      env.client.previewGenerationServiceUrl
    }?url=${
      env.client.url +
      '/' +
      encodeURIComponent(user.profile.username) +
      '/' +
      userArticle.slug +
      '/highlights/' +
      highlight.shortId
    }`

    axios.get(previewImageGenerationUrl).catch((err) => {
      log.warning(`Preview image generation request failed`, {
        axiosError: JSON.stringify(err),
        highlight,
        labels: {
          source: 'resolver',
          resolver: 'setShareHighlightResolver',
          articleId: highlight.articleId,
          userId: highlight.userId,
        },
      })
    })
  })
}

export const createHighlightResolver = authorized<
  CreateHighlightSuccess,
  CreateHighlightError,
  MutationCreateHighlightArgs
>(async (_, { input }, { models, claims, log }) => {
  const { articleId } = input
  const article = await getPageById(articleId)

  if (!article) {
    return {
      errorCodes: [CreateHighlightErrorCode.NotFound],
    }
  }

  analytics.track({
    userId: claims.uid,
    event: 'highlight_created',
    properties: {
      articleId: article.id,
      env: env.server.apiEnv,
    },
  })

  if (input.annotation && input.annotation.length > 4000) {
    return {
      errorCodes: [CreateHighlightErrorCode.BadData],
    }
  }

  try {
    const highlight = await models.highlight.create({
      ...input,
      articleId: undefined,
      userId: claims.uid,
      elasticPageId: article.id,
    })

    log.info('Creating a new highlight', {
      highlight,
      labels: {
        source: 'resolver',
        resolver: 'createHighlightResolver',
        uid: claims.uid,
      },
    })

    generateHighlightPreviewImage(models, highlight, log)

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
>(async (_, { input }, { authTrx, models, claims, log }) => {
  const { articleId } = input
  const { overlapHighlightIdList, ...newHighlightInput } = input
  const articleHighlights = await models.highlight.batchGet(articleId)

  if (!articleHighlights.length) {
    return {
      errorCodes: [MergeHighlightErrorCode.NotFound],
    }
  }

  /* Compute merged annotation form the order of highlights appearing on page */
  const overlapAnnotations: { [id: string]: string } = {}
  articleHighlights.forEach((highlight) => {
    if (overlapHighlightIdList.includes(highlight.id) && highlight.annotation) {
      overlapAnnotations[highlight.id] = highlight.annotation
    }
  })
  const mergedAnnotation: string[] = []
  overlapHighlightIdList.forEach((highlightId) => {
    if (overlapAnnotations[highlightId]) {
      mergedAnnotation.push(overlapAnnotations[highlightId])
    }
  })

  try {
    const highlight = await authTrx(async (tx) => {
      await models.highlight.deleteMany(overlapHighlightIdList, tx)
      return await models.highlight.create({
        ...newHighlightInput,
        annotation: mergedAnnotation ? mergedAnnotation.join('\n') : null,
        userId: claims.uid,
        elasticPageId: newHighlightInput.articleId,
      })
    })
    if (!highlight) {
      throw new Error('Failed to create merged highlight')
    }

    log.info('Creating a merged highlight', {
      highlight,
      labels: {
        source: 'resolver',
        resolver: 'mergeHighlightResolver',
        uid: claims.uid,
        articleId: articleId,
      },
    })

    generateHighlightPreviewImage(models, highlight, log)

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
>(async (_, { input }, { authTrx, models, claims, log }) => {
  const { highlightId } = input
  const highlight = await models.highlight.get(highlightId)

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

  const updatedHighlight = await authTrx((tx) =>
    models.highlight.update(
      highlightId,
      {
        annotation: input.annotation,
        sharedAt: input.sharedAt,
      },
      tx
    )
  )

  log.info('Updating a highlight', {
    updatedHighlight,
    labels: {
      source: 'resolver',
      resolver: 'updateHighlightResolver',
      uid: claims.uid,
    },
  })

  return { highlight: highlightDataToHighlight(updatedHighlight) }
})

export const deleteHighlightResolver = authorized<
  DeleteHighlightSuccess,
  DeleteHighlightError,
  MutationDeleteHighlightArgs
>(async (_, { highlightId }, { authTrx, models, claims, log }) => {
  const highlight = await models.highlight.get(highlightId)

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

  const deletedHighlight = await authTrx((tx) =>
    models.highlight.delete(highlightId, tx)
  )

  if ('error' in deletedHighlight) {
    return {
      errorCodes: [DeleteHighlightErrorCode.NotFound],
    }
  }

  log.info('Deleting a highlight', {
    deletedHighlight,
    labels: {
      source: 'resolver',
      resolver: 'deleteHighlightResolver',
      uid: claims.uid,
    },
  })

  return { highlight: highlightDataToHighlight(deletedHighlight) }
})

export const setShareHighlightResolver = authorized<
  SetShareHighlightSuccess,
  SetShareHighlightError,
  MutationSetShareHighlightArgs
>(async (_, { input: { id, share } }, { authTrx, models, claims, log }) => {
  const highlight = await models.highlight.get(id)

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
      articleId: highlight.articleId,
      userId: highlight.userId,
    },
  })

  const updatedHighlight = await authTrx((tx) =>
    models.highlight.update(id, { sharedAt }, tx)
  )

  if (!updatedHighlight || 'error' in updatedHighlight) {
    return {
      errorCodes: [SetShareHighlightErrorCode.NotFound],
    }
  }

  return { highlight: highlightDataToHighlight(updatedHighlight) }
})
