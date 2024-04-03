import { appDataSource } from '../../data_source'
import {
  DiscoverFeed,
  DiscoverFeedError,
  DiscoverFeedErrorCode,
  DiscoverFeedSuccess,
} from '../../generated/graphql'
import { authorized } from '../../utils/gql-utils'

export const getDiscoverFeedsResolver = authorized<
  DiscoverFeedSuccess,
  DiscoverFeedError
>(async (_, _args, { uid, log }) => {
  try {
    const existingFeed = (await appDataSource.query(
      `SELECT *, COALESCE(visible_name, title) as "visibleName" FROM omnivore.discover_feed_subscription sub
      INNER JOIN omnivore.discover_feed feed on sub.feed_id=id
      WHERE sub.user_id = $1`,
      [uid]
    )) as {
      rows: DiscoverFeed[]
    }

    return {
      __typename: 'DiscoverFeedSuccess',
      feeds: existingFeed.rows || [],
    }
  } catch (error) {
    log.error('Error Getting Discover Feed Subscriptions', error)

    return {
      __typename: 'DiscoverFeedError',
      errorCodes: [DiscoverFeedErrorCode.Unauthorized],
    }
  }
})
