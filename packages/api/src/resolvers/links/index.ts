import { LibraryItemState } from '../../entity/library_item'
import { env } from '../../env'
import {
  ArchiveLinkError,
  ArchiveLinkErrorCode,
  ArchiveLinkSuccess,
  MutationSetLinkArchivedArgs,
} from '../../generated/graphql'
import { updateLibraryItem } from '../../services/library_item'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'

// export const updateLinkShareInfoResolver = authorized<
//   UpdateLinkShareInfoSuccess,
//   UpdateLinkShareInfoError,
//   MutationUpdateLinkShareInfoArgs
// >(async (_obj, args, { models, claims, authTrx, log }) => {
//   const { title, description } = args.input

//   log.info('updateLinkShareInfoResolver', args.input.linkId, title, description)

//   // TEMP: because the old API uses articles instead of Links, we are actually
//   // getting an article ID here and need to map it to a link ID. When the API
//   // is updated to use Links instead of Articles this will be removed.
//   const link = await authTrx((tx) =>
//     models.userArticle.getByArticleId(claims.uid, args.input.linkId, tx)
//   )

//   if (!link?.id) {
//     return {
//       __typename: 'UpdateLinkShareInfoError',
//       errorCodes: [UpdateLinkShareInfoErrorCode.Unauthorized],
//     }
//   }

//   const result = await authTrx((tx) =>
//     createOrUpdateLinkShareInfo(tx, link.id, title, description)
//   )
//   if (!result) {
//     return {
//       __typename: 'UpdateLinkShareInfoError',
//       errorCodes: [UpdateLinkShareInfoErrorCode.BadRequest],
//     }
//   }

//   return {
//     __typename: 'UpdateLinkShareInfoSuccess',
//     message: 'Updated Share Information',
//   }
// })

export const setLinkArchivedResolver = authorized<
  ArchiveLinkSuccess,
  ArchiveLinkError,
  MutationSetLinkArchivedArgs
>(async (_obj, args, { uid }) => {
  let state = LibraryItemState.Archived
  let archivedAt: Date | null = new Date()
  let event = 'link_archived'

  const isUnarchive = !args.input.archived
  if (isUnarchive) {
    state = LibraryItemState.Succeeded
    archivedAt = null
    event = 'link_unarchived'
  }

  analytics.capture({
    distinctId: uid,
    event,
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    await updateLibraryItem(
      args.input.linkId,
      {
        state,
        archivedAt,
        seenAt: new Date(),
      },
      uid
    )
  } catch (e) {
    return {
      message: 'An error occurred',
      errorCodes: [ArchiveLinkErrorCode.BadRequest],
    }
  }

  return {
    linkId: args.input.linkId,
    message: event,
  }
})
