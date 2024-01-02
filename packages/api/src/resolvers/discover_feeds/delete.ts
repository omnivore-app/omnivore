import { authorized, getAbsoluteUrl } from '../../utils/helpers'
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
      `SELECT * FROM omnivore.discover_feed_subscription sub
      INNER JOIN omnivore.discover_feed feed on sub.feed_id=title
      WHERE sub.user_id = $1`,
      [uid],
    )) as {
      rows: DiscoverFeed[]
    }

    await queryRunner.release()
    return {
      __typename: 'DiscoverFeedSuccess',
      feeds: existingFeed.rows || [],
    }
  } catch (error) {
    log.error('Error Getting Discovery Feed Subscriptions', error)

    return {
      __typename: 'DiscoverFeedError',
      errorCodes: [DiscoverFeedErrorCode.Unauthorized],
    }
  }
})
