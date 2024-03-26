import { appDataSource } from '../../data_source'
import {
  EditDiscoverFeedError,
  EditDiscoverFeedErrorCode,
  EditDiscoverFeedSuccess,
  MutationEditDiscoverFeedArgs,
} from '../../generated/graphql'
import { authorized } from '../../utils/gql-utils'

export const editDiscoverFeedsResolver = authorized<
  EditDiscoverFeedSuccess,
  EditDiscoverFeedError,
  MutationEditDiscoverFeedArgs
>(async (_, { input: { feedId, name } }, { uid, log }) => {
  try {
    // Ensure that it actually exists for the user.
    const feeds = (await appDataSource.query(
      `SELECT * FROM omnivore.discover_feed_subscription sub
      WHERE sub.user_id = $1 and sub.feed_id = $2`,
      [uid, feedId]
    )) as {
      rows: {
        feed_id: string
      }[]
    }

    if (feeds.rows.length == 0) {
      return {
        __typename: 'EditDiscoverFeedError',
        errorCodes: [EditDiscoverFeedErrorCode.NotFound],
      }
    }

    await appDataSource.query(
      `UPDATE omnivore.discover_feed_subscription SET visible_name = $1
      WHERE user_id = $2 and feed_id = $3`,
      [name, uid, feedId]
    )

    return {
      __typename: 'EditDiscoverFeedSuccess',
      id: feedId,
    }
  } catch (error) {
    log.error('Error Updating Discover Feed Subscriptions', error)

    return {
      __typename: 'EditDiscoverFeedError',
      errorCodes: [EditDiscoverFeedErrorCode.Unauthorized],
    }
  }
})
