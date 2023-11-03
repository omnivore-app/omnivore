import { UserFeedItem } from '../../entity/user_feed_item'
import { env } from '../../env'
import {
  FeedEdge,
  FeedsError,
  FeedsErrorCode,
  FeedsSuccess,
  FollowingEdge,
  FollowingError,
  FollowingErrorCode,
  FollowingSuccess,
  MutationSaveFollowingArgs,
  QueryFeedsArgs,
  QueryFollowingArgs,
  SaveFollowingError,
  SaveFollowingErrorCode,
  SaveFollowingSuccess,
} from '../../generated/graphql'
import { feedRepository } from '../../repository/feed'
import { userRepository } from '../../repository/user'
import { userFeedItemRepository } from '../../repository/user_feed_item'
import { saveUrl } from '../../services/save_url'
import { analytics } from '../../utils/analytics'
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

export const saveFollowing = authorized<
  SaveFollowingSuccess,
  SaveFollowingError,
  MutationSaveFollowingArgs
>(async (_, args, { authTrx, log, uid }) => {
  try {
    analytics.track({
      userId: uid,
      event: 'save_following',
      properties: {
        id: args.id,
        env: env.server.apiEnv,
      },
    })

    const user = await userRepository.findById(uid)
    if (!user) {
      return { errorCodes: [SaveFollowingErrorCode.Unauthorized] }
    }

    const result = await authTrx((tx) =>
      tx.withRepository(userFeedItemRepository).updateAndReturn(args.id, {
        savedAt: new Date(),
      })
    )

    if (!result.affected || result.affected < 1) {
      return {
        errorCodes: [SaveFollowingErrorCode.NotFound],
      }
    }

    const userFeedItem = result.generatedMaps[0] as UserFeedItem

    const saveResult = await saveUrl(
      {
        url: userFeedItem.feedItem.links[0],
        clientRequestId: '',
        source: 'following',
      },
      user
    )
  } catch (error) {
    log.error('Error saving following', error)

    return {
      errorCodes: [FeedsErrorCode.BadRequest],
    }
  }
})
