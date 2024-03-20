import { authorized } from '../../utils/gql-utils'
import {
  DiscoverFeed,
  DiscoverFeedError,
  DiscoverFeedErrorCode,
  DiscoverFeedSuccess,
} from '../../generated/graphql'
import { appDataSource } from '../../data_source'
import { QueryRunner } from 'typeorm'

export const getDiscoverFeedsResolver = authorized<
  DiscoverFeedSuccess,
  DiscoverFeedError
>(async (_, _args, { uid, log }) => {
  try {
    const queryRunner = (await appDataSource
      .createQueryRunner()
      .connect()) as QueryRunner

    const existingFeed = (await queryRunner.query(
      `SELECT *, COALESCE(visible_name, title) as "visibleName" FROM omnivore.discover_feed_subscription sub
      INNER JOIN omnivore.discover_feed feed on sub.feed_id=id
      WHERE sub.user_id = $1`,
      [uid]
    )) as {
      rows: DiscoverFeed[]
    }

    await queryRunner.release()
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
