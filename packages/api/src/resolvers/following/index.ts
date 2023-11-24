import axios from 'axios'
import { parseHTML } from 'linkedom'
import { LibraryItem } from '../../entity/library_item'
import {
  FeedEdge,
  FeedsError,
  FeedsErrorCode,
  FeedsSuccess,
  MoveToFolderError,
  MoveToFolderErrorCode,
  MoveToFolderSuccess,
  MutationMoveToFolderArgs,
  QueryFeedsArgs,
  QueryScanFeedsArgs,
  ScanFeedsError,
  ScanFeedsErrorCode,
  ScanFeedsSuccess,
  ScanFeedsType,
} from '../../generated/graphql'
import { feedRepository } from '../../repository/feed'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { updateLibraryItem } from '../../services/library_item'
import { analytics } from '../../utils/analytics'
import {
  authorized,
  libraryItemToArticleSavingRequest,
} from '../../utils/helpers'
import { parseOpml } from '../../utils/parser'

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

export const moveToFolderResolver = authorized<
  MoveToFolderSuccess,
  MoveToFolderError,
  MutationMoveToFolderArgs
>(async (_, { id, folder }, { authTrx, pubsub, uid }) => {
  analytics.track({
    userId: uid,
    event: 'move_to_folder',
    properties: {
      id,
      folder,
    },
  })

  const item = await authTrx((tx) =>
    tx.getRepository(LibraryItem).findOne({
      where: {
        id,
      },
      relations: ['user'],
    })
  )

  if (!item) {
    return {
      errorCodes: [MoveToFolderErrorCode.Unauthorized],
    }
  }

  if (item.folder === folder) {
    return {
      errorCodes: [MoveToFolderErrorCode.AlreadyExists],
    }
  }

  const savedAt = new Date()

  // if the content is not fetched yet, create a page save request
  if (!item.readableContent) {
    const articleSavingRequest = await createPageSaveRequest({
      userId: uid,
      url: item.originalUrl,
      articleSavingRequestId: id,
      priority: 'high',
      publishedAt: item.publishedAt || undefined,
      savedAt,
      pubsub,
    })

    return {
      __typename: 'MoveToFolderSuccess',
      articleSavingRequest,
    }
  }

  const updatedItem = await updateLibraryItem(
    item.id,
    {
      folder,
      savedAt,
    },
    uid,
    pubsub
  )

  return {
    __typename: 'MoveToFolderSuccess',
    articleSavingRequest: libraryItemToArticleSavingRequest(
      updatedItem.user,
      updatedItem
    ),
  }
})

export const scanFeedsResolver = authorized<
  ScanFeedsSuccess,
  ScanFeedsError,
  QueryScanFeedsArgs
>(async (_, { input: { type, opml, url } }, { log, uid }) => {
  analytics.track({
    userId: uid,
    event: 'scan_feeds',
    properties: {
      type,
    },
  })

  if (type === ScanFeedsType.Opml) {
    if (!opml) {
      return {
        errorCodes: [ScanFeedsErrorCode.BadRequest],
      }
    }

    // parse opml
    const feeds = parseOpml(opml)
    if (!feeds) {
      return {
        errorCodes: [ScanFeedsErrorCode.BadRequest],
      }
    }

    return {
      __typename: 'ScanFeedsSuccess',
      feeds: feeds.map((feed) => ({
        url: feed.feedUrl,
        title: feed.title,
        type: feed.feedType || 'rss',
      })),
    }
  }

  if (!url) {
    return {
      errorCodes: [ScanFeedsErrorCode.BadRequest],
    }
  }

  try {
    // fetch HTML and parse feeds
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html',
      },
    })
    const html = response.data as string
    const dom = parseHTML(html).document
    const links = dom.querySelectorAll('link[type="application/rss+xml"]')
    const feeds = Array.from(links)
      .map((link) => ({
        url: link.getAttribute('href') || '',
        title: link.getAttribute('title') || '',
        type: 'rss',
      }))
      .filter((feed) => feed.url)

    return {
      __typename: 'ScanFeedsSuccess',
      feeds,
    }
  } catch (error) {
    log.error('Error scanning HTML', error)

    return {
      errorCodes: [ScanFeedsErrorCode.BadRequest],
    }
  }
})
