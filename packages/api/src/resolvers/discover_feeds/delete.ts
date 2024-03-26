import { appDataSource } from '../../data_source'
import {
  DeleteDiscoverFeedError,
  DeleteDiscoverFeedErrorCode,
  DeleteDiscoverFeedSuccess,
  MutationDeleteDiscoverFeedArgs,
} from '../../generated/graphql'
import { authorized } from '../../utils/gql-utils'

export const deleteDiscoverFeedsResolver = authorized<
  DeleteDiscoverFeedSuccess,
  DeleteDiscoverFeedError,
  MutationDeleteDiscoverFeedArgs
>(async (_, { input: { feedId } }, { uid, log }) => {
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
        __typename: 'DeleteDiscoverFeedError',
        errorCodes: [DeleteDiscoverFeedErrorCode.NotFound],
      }
    }

    await appDataSource.query(
      `DELETE FROM omnivore.discover_feed_subscription sub
      WHERE sub.user_id = $1 and sub.feed_id = $2`,
      [uid, feedId]
    )

    return {
      __typename: 'DeleteDiscoverFeedSuccess',
      id: feedId,
    }
  } catch (error) {
    log.error('Error Getting Discover Feed Subscriptions', error)

    return {
      __typename: 'DeleteDiscoverFeedError',
      errorCodes: [DeleteDiscoverFeedErrorCode.Unauthorized],
    }
  }
})
