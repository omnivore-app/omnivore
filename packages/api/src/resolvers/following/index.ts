import { IsNull, Not } from 'typeorm'
import { LibraryItem } from '../../entity/library_item'
import {
  CopyFromFollowingToLibraryError,
  CopyFromFollowingToLibraryErrorCode,
  CopyFromFollowingToLibrarySuccess,
  FeedEdge,
  FeedsError,
  FeedsErrorCode,
  FeedsSuccess,
  MutationCopyFromFollowingToLibraryArgs,
  QueryFeedsArgs,
} from '../../generated/graphql'
import { feedRepository } from '../../repository/feed'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { updateLibraryItem } from '../../services/library_item'
import { analytics } from '../../utils/analytics'
import {
  authorized,
  libraryItemToArticleSavingRequest,
} from '../../utils/helpers'

export const feedsResolver = authorized<
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

export const copyFromFollowingToLibraryResolver = authorized<
  CopyFromFollowingToLibrarySuccess,
  CopyFromFollowingToLibraryError,
  MutationCopyFromFollowingToLibraryArgs
>(async (_, { id }, { authTrx, pubsub, uid }) => {
  analytics.track({
    userId: uid,
    event: 'copy_from_following_to_library',
    properties: {
      id,
    },
  })

  const item = await authTrx((tx) =>
    tx.getRepository(LibraryItem).findOne({
      where: {
        id,
        addedToFollowingAt: Not(IsNull()),
      },
      relations: ['user'],
    })
  )

  if (!item) {
    return {
      errorCodes: [CopyFromFollowingToLibraryErrorCode.Unauthorized],
    }
  }

  if (item.addedToLibraryAt) {
    return {
      errorCodes: [CopyFromFollowingToLibraryErrorCode.AlreadyExists],
    }
  }

  const addedToLibraryAt = new Date()

  // if the content is not fetched yet, create a page save request
  if (!item.readableContent) {
    const articleSavingRequest = await createPageSaveRequest({
      userId: uid,
      url: item.originalUrl,
      articleSavingRequestId: id,
      priority: 'high',
      publishedAt: item.publishedAt || undefined,
      savedAt: addedToLibraryAt,
      pubsub,
    })

    return {
      __typename: 'CopyFromFollowingToLibrarySuccess',
      articleSavingRequest,
    }
  }

  const updatedItem = await updateLibraryItem(
    item.id,
    {
      savedAt: addedToLibraryAt,
      addedToLibraryAt,
    },
    uid,
    pubsub
  )

  return {
    __typename: 'CopyFromFollowingToLibrarySuccess',
    articleSavingRequest: libraryItemToArticleSavingRequest(
      updatedItem.user,
      updatedItem
    ),
  }
})
