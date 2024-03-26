import { appDataSource } from '../../../data_source'
import { LibraryItemState } from '../../../entity/library_item'
import {
  DeleteDiscoverArticleError,
  DeleteDiscoverArticleErrorCode,
  DeleteDiscoverArticleSuccess,
  MutationDeleteDiscoverArticleArgs,
} from '../../../generated/graphql'
import { userRepository } from '../../../repository/user'
import { updateLibraryItem } from '../../../services/library_item'
import { authorized } from '../../../utils/gql-utils'

export const deleteDiscoverArticleResolver = authorized<
  DeleteDiscoverArticleSuccess,
  DeleteDiscoverArticleError,
  MutationDeleteDiscoverArticleArgs
>(async (_, { input: { discoverArticleId } }, { uid, log, pubsub }) => {
  try {
    const user = await userRepository.findById(uid)
    if (!user) {
      return {
        __typename: 'DeleteDiscoverArticleError',
        errorCodes: [DeleteDiscoverArticleErrorCode.Unauthorized],
      }
    }

    const { rows: discoverArticles } = (await appDataSource.query(
      `SELECT article_save_id FROM omnivore.discover_feed_save_link WHERE discover_article_id=$1 and user_id=$2`,
      [discoverArticleId, uid]
    )) as {
      rows: { article_save_id: string }[]
    }

    if (discoverArticles.length != 1) {
      return {
        __typename: 'DeleteDiscoverArticleError',
        errorCodes: [DeleteDiscoverArticleErrorCode.NotFound],
      }
    }

    await appDataSource.query(
      `UPDATE omnivore.discover_feed_save_link set deleted = true WHERE discover_article_id=$1 and user_id=$2`,
      [discoverArticleId, uid]
    )

    await updateLibraryItem(
      discoverArticles[0].article_save_id,
      {
        state: LibraryItemState.Deleted,
        deletedAt: new Date(),
      },
      uid,
      pubsub
    )

    return {
      __typename: 'DeleteDiscoverArticleSuccess',
      id: discoverArticleId,
    }
  } catch (error) {
    log.error('Error Deleting Article', error)

    return {
      __typename: 'DeleteDiscoverArticleError',
      errorCodes: [DeleteDiscoverArticleErrorCode.Unauthorized],
    }
  }
})
