import {
  MutationSaveDiscoverArticleArgs,
  SaveDiscoverArticleError,
  SaveDiscoverArticleErrorCode,
  SaveDiscoverArticleSuccess,
} from '../../../generated/graphql'
import { libraryItemRepository } from '../../../repository/library_item'
import { savePage } from '../../../services/save_page'
import { findActiveUser } from '../../../services/user'
import { authorized } from '../../../utils/gql-utils'

export const saveDiscoverArticleResolver = authorized<
  SaveDiscoverArticleSuccess,
  SaveDiscoverArticleError,
  MutationSaveDiscoverArticleArgs
>(async (_, { input: { discoverArticleId } }, { authTrx, uid }) => {
  const user = await findActiveUser(uid)
  if (!user) {
    return {
      __typename: 'SaveDiscoverArticleError',
      errorCodes: [SaveDiscoverArticleErrorCode.Unauthorized],
    }
  }

  const discoverItem = await authTrx(
    async (t) =>
      await t.withRepository(libraryItemRepository).findById(discoverArticleId)
  )

  if (!discoverItem) {
    return {
      __typename: 'SaveDiscoverArticleError',
      errorCodes: [SaveDiscoverArticleErrorCode.NotFound],
    }
  }

  const saveResult = await savePage(
    {
      clientRequestId: '',
      title: discoverItem.title,
      originalContent: discoverItem.originalContent || '',
      rssFeedUrl: discoverItem.subscription,
      url: discoverItem.originalUrl,
      source: 'discover',
      publishedAt: discoverItem.publishedAt,
      author: discoverItem.author || undefined,
      previewImage: discoverItem.thumbnail || undefined,
    },
    user
  )

  if (saveResult.__typename === 'SaveSuccess') {
    return {
      __typename: 'SaveDiscoverArticleSuccess',
      saveId: saveResult.clientRequestId,
      url: saveResult.url,
    }
  }

  return {
    __typename: 'SaveDiscoverArticleError',
    errorCodes: [SaveDiscoverArticleErrorCode.Unauthorized],
  }
})
