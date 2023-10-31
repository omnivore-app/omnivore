import {
  FeedEdge,
  FeedsError,
  FeedsErrorCode,
  FeedsSuccess,
  FollowingEdge,
  FollowingError,
  FollowingErrorCode,
  FollowingSuccess,
  QueryFeedsArgs,
  QueryFollowingArgs,
} from '../../generated/graphql'
import { feedRepository } from '../../repository/feed'
import { userFeedItemRepository } from '../../repository/user_feed_item'
import { authorized } from '../../utils/helpers'

export const feedsResolve = authorized<
  FeedsSuccess,
  FeedsError,
  QueryFeedsArgs
>(async (_, { input }, { log }) => {
  try {
    const startCursor = input.after || ''
    const start =
      startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
    const first = Math.min(input.first || 10, 100) // cap at 100

    const { feeds, count } = await feedRepository.searchFeeds(
      input.query || '',
      first + 1, // fetch one extra to check if there is a next page
      start,
      input.sort?.by,
      input.sort?.order || undefined
    )

    const hasNextPage = feeds.length > first
    const endCursor = String(start + feeds.length - (hasNextPage ? 1 : 0))

    if (hasNextPage) {
      // remove an extra if exists
      feeds.pop()
    }

    const edges: FeedEdge[] = feeds.map((feed) => ({
      node: feed,
      cursor: endCursor,
    }))

    return {
      __typename: 'FeedsSuccess',
      edges,
      pageInfo: {
        hasPreviousPage: start > 0,
        hasNextPage,
        startCursor,
        endCursor,
        totalCount: count,
      },
    }
  } catch (error) {
    log.error('Error fetching feeds', error)

    return {
      errorCodes: [FeedsErrorCode.BadRequest],
    }
  }
})

export const followingResolver = authorized<
  FollowingSuccess,
  FollowingError,
  QueryFollowingArgs
>(async (_, args, { authTrx, log }) => {
  try {
    const startCursor = args.after || ''
    const start =
      startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
    const first = Math.min(args.first || 10, 100) // cap at 100
    const since = args.since ? new Date(args.since) : undefined
    const until = args.until ? new Date(args.until) : undefined

    const { userFeedItems, count } = await authTrx((tx) =>
      tx.withRepository(userFeedItemRepository).searchUserFeedItems(
        first + 1, // fetch one extra to check if there is a next page
        start,
        since,
        until
      )
    )

    const hasNextPage = userFeedItems.length > first
    const endCursor = String(
      start + userFeedItems.length - (hasNextPage ? 1 : 0)
    )

    if (hasNextPage) {
      // remove an extra if exists
      userFeedItems.pop()
    }

    const edges: FollowingEdge[] = userFeedItems.map((item) => ({
      node: {
        ...item.feedItem,
        ...item,
        isHidden: !!item.hiddenAt,
        isSaved: !!item.savedAt,
        feedItemId: item.feedItem.id,
      },
      cursor: endCursor,
    }))

    return {
      __typename: 'FollowingSuccess',
      edges,
      pageInfo: {
        hasPreviousPage: start > 0,
        hasNextPage,
        startCursor,
        endCursor,
        totalCount: count,
      },
    }
  } catch (error) {
    log.error('Error fetching following', error)

    return {
      errorCodes: [FollowingErrorCode.Unauthorized],
    }
  }
})
