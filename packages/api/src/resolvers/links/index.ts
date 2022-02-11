import { createOrUpdateLinkShareInfo } from '../../datalayer/links/share_info'

import {
  UpdateLinkShareInfoError,
  UpdateLinkShareInfoSuccess,
  UpdateLinkShareInfoErrorCode,
  MutationUpdateLinkShareInfoArgs,
  ArchiveLinkSuccess,
  ArchiveLinkError,
  MutationSetLinkArchivedArgs,
  ArchiveLinkErrorCode,
} from '../../generated/graphql'
import { setLinkArchived } from '../../services/archive_link'

import { authorized } from '../../utils/helpers'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'

export const updateLinkShareInfoResolver = authorized<
  UpdateLinkShareInfoSuccess,
  UpdateLinkShareInfoError,
  MutationUpdateLinkShareInfoArgs
>(async (_obj, args, { models, claims, authTrx }) => {
  const { title, description } = args.input

  console.log(
    'updateLinkShareInfoResolver',
    args.input.linkId,
    title,
    description
  )

  // TEMP: because the old API uses articles instead of Links, we are actually
  // getting an article ID here and need to map it to a link ID. When the API
  // is updated to use Links instead of Articles this will be removed.
  const link = await authTrx((tx) =>
    models.userArticle.getByArticleId(claims.uid, args.input.linkId, tx)
  )

  if (!link?.id) {
    return {
      __typename: 'UpdateLinkShareInfoError',
      errorCodes: [UpdateLinkShareInfoErrorCode.Unauthorized],
    }
  }

  const result = await authTrx((tx) =>
    createOrUpdateLinkShareInfo(tx, link.id, title, description)
  )
  if (!result) {
    return {
      __typename: 'UpdateLinkShareInfoError',
      errorCodes: [UpdateLinkShareInfoErrorCode.BadRequest],
    }
  }

  return {
    __typename: 'UpdateLinkShareInfoSuccess',
    message: 'Updated Share Information',
  }
})

export const setLinkArchivedResolver = authorized<
  ArchiveLinkSuccess,
  ArchiveLinkError,
  MutationSetLinkArchivedArgs
>(async (_obj, args, { models, claims, authTrx }) => {
  console.log('setLinkArchivedResolver', args.input.linkId)

  analytics.track({
    userId: claims.uid,
    event: args.input.archived ? 'link_archived' : 'link_unarchived',
    properties: {
      env: env.server.apiEnv,
    },
  })

  // TEMP: because the old API uses articles instead of Links, we are actually
  // getting an article ID here and need to map it to a link ID. When the API
  // is updated to use Links instead of Articles this will be removed.
  const link = await authTrx((tx) =>
    models.userArticle.getByArticleId(claims.uid, args.input.linkId, tx)
  )

  if (!link?.id) {
    return {
      message: 'An error occurred',
      errorCodes: [ArchiveLinkErrorCode.BadRequest],
    }
  }

  try {
    await setLinkArchived(claims.uid, link.id, args.input.archived)
  } catch (e) {
    return {
      message: 'An error occurred',
      errorCodes: [ArchiveLinkErrorCode.BadRequest],
    }
  }

  return {
    linkId: link.id,
    message: 'Link Archived',
  }
})
