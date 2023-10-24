import { Merge } from '../../util'
import { CreateReactionSuccess, Reaction } from './../../generated/graphql'

export type PartialReaction = Omit<Reaction, 'user'>

export type PartialCreateReactionSuccess = Merge<
  CreateReactionSuccess,
  { reaction: PartialReaction }
>

// export const createReactionResolver = authorized<
//   PartialCreateReactionSuccess,
//   CreateReactionError,
//   MutationCreateReactionArgs
// >(async (_, { input }, { models, claims, log, authTrx }) => {
//   const { userArticleId, highlightId } = input

//   if ((!userArticleId && !highlightId) || (userArticleId && highlightId)) {
//     // One reaction target is required
//     // Highlight replies hasn't supported yet
//     return {
//       errorCodes: [CreateReactionErrorCode.BadTarget],
//     }
//   }

//   if (input.code && input.code.length > 50) {
//     return {
//       errorCodes: [CreateReactionErrorCode.BadCode],
//     }
//   }

//   if (userArticleId) {
//     if (!(await models.userArticle.get(userArticleId))) {
//       return {
//         errorCodes: [CreateReactionErrorCode.BadTarget],
//       }
//     }
//   } else if (highlightId) {
//     if (!(await models.highlight.get(highlightId))) {
//       return {
//         errorCodes: [CreateReactionErrorCode.BadTarget],
//       }
//     }
//   }

//   try {
//     const previousReaction = userArticleId
//       ? await models.reaction.getByUserAndParam(claims.uid, { userArticleId })
//       : await models.reaction.getByUserAndParam(claims.uid, { highlightId })

//     let reaction
//     if (!previousReaction) {
//       reaction = await authTrx((tx) =>
//         models.reaction.create({ ...input, userId: claims.uid }, tx)
//       )
//     } else {
//       reaction = await authTrx((tx) =>
//         models.reaction.update(
//           previousReaction.id,
//           {
//             code: input.code,
//           },
//           tx
//         )
//       )
//     }

//     if (!reaction) {
//       return {
//         errorCodes: [CreateReactionErrorCode.NotFound],
//       }
//     }
//     log.info(`${previousReaction ? 'Updating' : 'Creating'} a new reaction`, {
//       reaction,
//       labels: {
//         source: 'resolver',
//         resolver: 'createReactionResolver',
//         uid: claims.uid,
//       },
//     })

//     return {
//       reaction: reaction as PartialReaction,
//     }
//   } catch (err) {
//     log.info(err)
//     return {
//       errorCodes: [CreateReactionErrorCode.NotFound],
//     }
//   }
// })

// export const deleteReactionResolver = authorized<
//   PartialCreateReactionSuccess,
//   DeleteReactionError,
//   MutationDeleteReactionArgs
// >(async (_, { id }, { authTrx, models, claims, log }) => {
//   const reaction = await models.reaction.get(id)

//   if (!reaction?.id) {
//     return {
//       errorCodes: [DeleteReactionErrorCode.NotFound],
//     }
//   }

//   if (reaction.userId !== claims.uid) {
//     return {
//       errorCodes: [DeleteReactionErrorCode.Forbidden],
//     }
//   }

//   const deleted = await authTrx((tx) => models.reaction.delete(id, tx))

//   if ('error' in deleted) {
//     return {
//       errorCodes: [DeleteReactionErrorCode.NotFound],
//     }
//   }

//   log.info('Deleting a highlight', {
//     deleted,
//     labels: {
//       source: 'resolver',
//       resolver: 'deleteHighlightResolver',
//       uid: claims.uid,
//     },
//   })

//   return {
//     reaction: reaction as PartialReaction,
//   }
// })
