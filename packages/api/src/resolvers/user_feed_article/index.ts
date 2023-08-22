/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PartialArticle } from '..'
import {
  FeedArticle,
  PageInfo,
  SharedArticleSuccess,
} from '../../generated/graphql'
import { Merge } from '../../util'

export type PartialFeedArticle = Omit<
  FeedArticle,
  'sharedBy' | 'article' | 'reactions'
>

type PaginatedFeedArticlesSuccessPartial = {
  edges: { cursor: string; node: PartialFeedArticle }[]
  pageInfo: PageInfo
}

export type SharedArticleSuccessPartial = Merge<
  SharedArticleSuccess,
  { article: PartialArticle }
>

// export const getSharedArticleResolver: ResolverFn<
//   SharedArticleSuccessPartial | SharedArticleError,
//   Record<string, unknown>,
//   WithDataSourcesContext,
//   QuerySharedArticleArgs
// > = async (_obj, { username, slug, selectedHighlightId }, { kx, models }) => {
//   try {
//     const user = await models.user.getWhere({ username })
//     if (!user) {
//       return {
//         errorCodes: [SharedArticleErrorCode.NotFound],
//       }
//     }

//     const article = await models.userArticle.getBySlug(username, slug)
//     if (!article || !article.sharedAt) {
//       return {
//         errorCodes: [SharedArticleErrorCode.NotFound],
//       }
//     }

//     if (selectedHighlightId) {
//       const highlightResult = await models.highlight.getWhereIn('shortId', [
//         selectedHighlightId,
//       ])
//       if (!highlightResult || !highlightResult[0].sharedAt) {
//         return {
//           errorCodes: [SharedArticleErrorCode.NotFound],
//         }
//       }
//     }

//     const shareInfo = await getShareInfoForArticle(
//       kx,
//       user.id,
//       article.id,
//       models
//     )

//     return { article: { ...article, userId: user.id, shareInfo: shareInfo } }
//   } catch (error) {
//     return { errorCodes: [SharedArticleErrorCode.NotFound] }
//   }
// }

// export const getUserFeedArticlesResolver: ResolverFn<
//   PaginatedFeedArticlesSuccessPartial,
//   unknown,
//   WithDataSourcesContext,
//   QueryFeedArticlesArgs
// > = async (
//   _obj,
//   { after: _startCursor, first: _first, sharedByUser },
//   { models, claims, authTrx }
// ) => {
//   if (!(sharedByUser || claims?.uid)) {
//     return {
//       edges: [],
//       pageInfo: {
//         startCursor: '',
//         endCursor: '',
//         hasNextPage: false,
//         hasPreviousPage: false,
//       },
//     }
//   }

//   const first = _first || 0
//   const startCursor = _startCursor || ''

//   const feedArticles =
//     (await authTrx((tx) =>
//       models.userArticle.getUserFeedArticlesPaginatedWithHighlights(
//         { cursor: startCursor, first: first + 1, sharedByUser }, // fetch one more item to get next cursor
//         claims?.uid || '',
//         tx
//       )
//     )) || []

//   const endCursor = feedArticles[feedArticles.length - 1]?.sharedAt
//     .getTime()
//     ?.toString()
//   const hasNextPage = feedArticles.length > first

//   if (hasNextPage) {
//     // remove an extra if exists
//     feedArticles.pop()
//   }

//   const edges = feedArticles.map((fa) => {
//     return {
//       node: fa,
//       cursor: fa.sharedAt.getTime()?.toString(),
//     }
//   })

//   return {
//     edges,
//     pageInfo: {
//       hasPreviousPage: false,
//       startCursor: '',
//       hasNextPage,
//       endCursor,
//     },
//   }
// }

// export const updateSharedCommentResolver = authorized<
//   UpdateSharedCommentSuccess,
//   UpdateSharedCommentError,
//   MutationUpdateSharedCommentArgs
// >(
//   async (
//     _,
//     { input: { articleID, sharedComment } },
//     { models, authTrx, claims: { uid } }
//   ) => {
//     const ua = await authTrx((tx) =>
//       models.userArticle.getByParameters(uid, { articleId: articleID }, tx)
//     )
//     if (!ua) {
//       return { errorCodes: [UpdateSharedCommentErrorCode.NotFound] }
//     }

//     await authTrx((tx) =>
//       models.userArticle.updateByArticleId(
//         uid,
//         articleID,
//         { sharedComment },
//         tx
//       )
//     )

//     return { articleID, sharedComment }
//   }
// )
