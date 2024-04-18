/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { DeepPartial } from 'typeorm'
import {
  Highlight as HighlightData,
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
  MergeHighlightError,
  MergeHighlightErrorCode,
  MergeHighlightSuccess,
  MutationCreateHighlightArgs,
  MutationDeleteHighlightArgs,
  MutationMergeHighlightArgs,
  MutationUpdateHighlightArgs,
  UpdateHighlightError,
  UpdateHighlightErrorCode,
  UpdateHighlightSuccess,
} from '../../generated/graphql'
import { highlightRepository } from '../../repository/highlight'
import {
  createHighlight,
  deleteHighlightById,
  mergeHighlights,
  updateHighlight,
} from '../../services/highlights'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'
import { highlightDataToHighlight } from '../../utils/helpers'

export const createHighlightResolver = authorized<
  CreateHighlightSuccess,
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

    return { highlight: highlightDataToHighlight(newHighlight) }
  } catch (err) {
    log.error('Error creating highlight', err)
    return {
      errorCodes: [CreateHighlightErrorCode.Forbidden],
    }
  }
})

export const mergeHighlightResolver = authorized<
  MergeHighlightSuccess,
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

    const highlight: DeepPartial<HighlightData> = {
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
      highlight: highlightDataToHighlight(newHighlight),
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
  UpdateHighlightSuccess,
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

    return { highlight: highlightDataToHighlight(updatedHighlight) }
  } catch (error) {
    log.error('updateHighlightResolver error', error)
    return {
      errorCodes: [UpdateHighlightErrorCode.Forbidden],
    }
  }
})

export const deleteHighlightResolver = authorized<
  DeleteHighlightSuccess,
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

    return { highlight: highlightDataToHighlight(deletedHighlight) }
  } catch (error) {
    log.error('deleteHighlightResolver error', error)
    return {
      errorCodes: [DeleteHighlightErrorCode.Forbidden],
    }
  }
})

// export const setShareHighlightResolver = authorized<
//   SetShareHighlightSuccess,
//   SetShareHighlightError,
//   MutationSetShareHighlightArgs
// >(async (_, { input: { id, share } }, { pubsub, claims, log }) => {
//   const highlight = await getHighlightById(id)

//   if (!highlight?.id) {
//     return {
//       errorCodes: [SetShareHighlightErrorCode.NotFound],
//     }
//   }

//   if (highlight.userId !== claims.uid) {
//     return {
//       errorCodes: [SetShareHighlightErrorCode.Forbidden],
//     }
//   }

//   const sharedAt = share ? new Date() : null

//   log.info(`${share ? 'S' : 'Uns'}haring a highlight`, {
//     highlight,
//     labels: {
//       source: 'resolver',
//       resolver: 'setShareHighlightResolver',
//       userId: highlight.userId,
//     },
//   })

//   const updatedHighlight: HighlightData = {
//     ...highlight,
//     sharedAt,
//     updatedAt: new Date(),
//   }

//   const updated = await updateHighlight(updatedHighlight, {
//     pubsub,
//     uid: claims.uid,
//     refresh: true,
//   })

//   if (!updated) {
//     return {
//       errorCodes: [SetShareHighlightErrorCode.NotFound],
//     }
//   }

//   return { highlight: highlightDataToHighlight(updatedHighlight) }
// })
