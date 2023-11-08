import {
  FeedEdge,
  FeedsError,
  FeedsErrorCode,
  FeedsSuccess,
  MutationSaveFollowingArgs,
  QueryFeedsArgs,
  SaveFollowingError,
  SaveFollowingSuccess,
} from '../../generated/graphql'
import { feedRepository } from '../../repository/feed'
import { createFollowing } from '../../services/library_item'
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

export const saveFollowingResolver = authorized<
  SaveFollowingSuccess,
  SaveFollowingError,
  MutationSaveFollowingArgs
>(async (_, { input }, { uid }) => {
  const newItem = await createFollowing(input, uid)

  return {
    __typename: 'SaveFollowingSuccess',
    following: {
      ...newItem,
      url: newItem.originalUrl,
      SharedAt: new Date(input.sharedAt),
      sharedBy: input.sharedBy,
      sharedSource: input.sharedSource,
    },
  }
})
