import { appDataSource } from '../../../data_source'
import {
  HideDiscoverArticleError,
  HideDiscoverArticleErrorCode,
  HideDiscoverArticleSuccess,
  MutationHideDiscoverArticleArgs,
} from '../../../generated/graphql'
import { userRepository } from '../../../repository/user'
import { authorized } from '../../../utils/gql-utils'

export const hideDiscoverArticleResolver = authorized<
  HideDiscoverArticleSuccess,
  HideDiscoverArticleError,
  MutationHideDiscoverArticleArgs
>(async (_, { input: { discoverArticleId, setHidden } }, { uid, log }) => {
  try {
    const user = await userRepository.findById(uid)
    if (!user) {
      return {
        __typename: 'HideDiscoverArticleError',
        errorCodes: [HideDiscoverArticleErrorCode.Unauthorized],
      }
    }

    const discoverArticles = (await appDataSource.query(
      `SELECT 1 FROM omnivore.discover_feed_articles WHERE id=$1`,
      [discoverArticleId]
    )) as 1[]

    if (discoverArticles.length != 1) {
      return {
        __typename: 'HideDiscoverArticleError',
        errorCodes: [HideDiscoverArticleErrorCode.NotFound],
      }
    }

    if (setHidden) {
      await appDataSource.query(
        `insert into omnivore.discover_feed_hide_link (discover_article_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [discoverArticleId, uid]
      )
    } else {
      await appDataSource.query(
        `DELETE FROM omnivore.discover_feed_hide_link WHERE user_id = $2 AND discover_article_id = $1;`,
        [discoverArticleId, uid]
      )
    }

    return {
      __typename: 'HideDiscoverArticleSuccess',
      id: discoverArticleId,
    }
  } catch (error) {
    log.error('Error Hiding Article', error)

    return {
      __typename: 'HideDiscoverArticleError',
      errorCodes: [HideDiscoverArticleErrorCode.Unauthorized],
    }
  }
})
