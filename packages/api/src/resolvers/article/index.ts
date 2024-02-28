/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Readability } from '@omnivore/readability'
import graphqlFields from 'graphql-fields'
import { IsNull } from 'typeorm'
import { LibraryItem, LibraryItemState } from '../../entity/library_item'
import { env } from '../../env'
import {
  ArticleError,
  ArticleErrorCode,
  ArticleSuccess,
  BulkActionError,
  BulkActionErrorCode,
  BulkActionSuccess,
  ContentReader,
  CreateArticleError,
  CreateArticleErrorCode,
  CreateArticleSuccess,
  EmptyTrashError,
  EmptyTrashSuccess,
  FetchContentError,
  FetchContentErrorCode,
  FetchContentSuccess,
  MoveToFolderError,
  MoveToFolderErrorCode,
  MoveToFolderSuccess,
  MutationBulkActionArgs,
  MutationCreateArticleArgs,
  MutationFetchContentArgs,
  MutationMoveToFolderArgs,
  MutationSaveArticleReadingProgressArgs,
  MutationSetBookmarkArticleArgs,
  MutationSetFavoriteArticleArgs,
  PageType,
  QueryArticleArgs,
  QuerySearchArgs,
  QueryTypeaheadSearchArgs,
  QueryUpdatesSinceArgs,
  SaveArticleReadingProgressError,
  SaveArticleReadingProgressErrorCode,
  SaveArticleReadingProgressSuccess,
  SearchError,
  SearchErrorCode,
  SearchSuccess,
  SetBookmarkArticleError,
  SetBookmarkArticleErrorCode,
  SetBookmarkArticleSuccess,
  SetFavoriteArticleError,
  SetFavoriteArticleErrorCode,
  SetFavoriteArticleSuccess,
  TypeaheadSearchError,
  TypeaheadSearchErrorCode,
  TypeaheadSearchSuccess,
  UpdateReason,
  UpdatesSinceError,
  UpdatesSinceSuccess,
} from '../../generated/graphql'
import { getColumns } from '../../repository'
import { getInternalLabelWithColor } from '../../repository/label'
import { libraryItemRepository } from '../../repository/library_item'
import { userRepository } from '../../repository/user'
import { clearCachedReadingPosition } from '../../services/cached_reading_position'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { findHighlightsByLibraryItemId } from '../../services/highlights'
import {
  addLabelsToLibraryItem,
  createAndSaveLabelsInLibraryItem,
  findOrCreateLabels,
} from '../../services/labels'
import {
  batchDelete,
  batchUpdateLibraryItems,
  countLibraryItems,
  createOrUpdateLibraryItem,
  findLibraryItemsByPrefix,
  searchLibraryItems,
  softDeleteLibraryItem,
  sortParamsToSort,
  updateLibraryItem,
  updateLibraryItemReadingProgress,
} from '../../services/library_item'
import { parsedContentToLibraryItem } from '../../services/save_page'
import {
  findUploadFileById,
  itemTypeForContentType,
  setFileUploadComplete,
} from '../../services/upload_file'
import { traceAs } from '../../tracing'
import { analytics } from '../../utils/analytics'
import { isSiteBlockedForParse } from '../../utils/blocked'
import { enqueueBulkAction } from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'
import {
  cleanUrl,
  errorHandler,
  generateSlug,
  isParsingTimeout,
  libraryItemToArticle,
  libraryItemToSearchItem,
  titleForFilePath,
  userDataToUser,
} from '../../utils/helpers'
import {
  contentConverter,
  getDistillerResult,
  htmlToMarkdown,
  ParsedContentPuppeteer,
  parsePreparedContent,
} from '../../utils/parser'
import { getStorageFileDetails } from '../../utils/uploads'

export enum ArticleFormat {
  Markdown = 'markdown',
  Html = 'html',
  Distiller = 'distiller',
  HighlightedMarkdown = 'highlightedMarkdown',
}

// These two page types are better handled by the backend
// where we can use APIs to fetch their underlying content.
const FORCE_PUPPETEER_URLS = [
  // twitter status url regex
  /twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?/,
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/,
]
const UNPARSEABLE_CONTENT = '<p>We were unable to parse this page.</p>'

export const createArticleResolver = authorized<
  CreateArticleSuccess,
  CreateArticleError,
  MutationCreateArticleArgs
>(
  async (
    _,
    {
      input: {
        url,
        preparedDocument,
        articleSavingRequestId,
        uploadFileId,
        skipParsing,
        source,
        state,
        labels: inputLabels,
        folder,
        rssFeedUrl,
        savedAt,
        publishedAt,
      },
    },
    { log, uid, pubsub }
  ) => {
    analytics.capture({
      distinctId: uid,
      event: 'link_saved',
      properties: {
        url,
        source,
        env: env.server.apiEnv,
      },
    })

    const userData = await userRepository.findById(uid)
    if (!userData) {
      return errorHandler(
        {
          errorCodes: [CreateArticleErrorCode.Unauthorized],
        },
        uid,
        articleSavingRequestId,
        pubsub
      )
    }
    const user = userDataToUser(userData)

    try {
      if (isSiteBlockedForParse(url)) {
        return errorHandler(
          {
            errorCodes: [CreateArticleErrorCode.NotAllowedToParse],
          },
          uid,
          articleSavingRequestId,
          pubsub
        )
      }

      url = cleanUrl(url)
      const { pathname } = new URL(url)

      const croppedPathname = decodeURIComponent(
        pathname
          .split('/')
          [pathname.split('/').length - 1].split('.')
          .slice(0, -1)
          .join('.')
      ).replace(/_/gi, ' ')

      let title: string | undefined
      let parsedContent: Readability.ParseResult | null = null
      let canonicalUrl
      let uploadFileHash = null
      let domContent = null
      let itemType = PageType.Unknown

      const DUMMY_RESPONSE: CreateArticleSuccess = {
        user,
        created: false,
        createdArticle: {
          id: '',
          slug: '',
          createdAt: new Date(),
          originalHtml: domContent,
          content: '',
          description: '',
          title: '',
          pageType: itemType,
          contentReader: ContentReader.Web,
          author: '',
          url,
          hash: '',
          isArchived: false,
          readingProgressAnchorIndex: 0,
          readingProgressPercent: 0,
          highlights: [],
          savedAt: savedAt || new Date(),
          updatedAt: new Date(),
          folder: '',
          publishedAt,
          subscription: rssFeedUrl,
        },
      }

      if (uploadFileId) {
        /* We do not trust the values from client, lookup upload file by querying
         * with filtering on user ID and URL to verify client's uploadFileId is valid.
         */
        const uploadFile = await findUploadFileById(uploadFileId)
        if (!uploadFile) {
          return errorHandler(
            { errorCodes: [CreateArticleErrorCode.UploadFileMissing] },
            uid,
            articleSavingRequestId,
            pubsub
          )
        }
        const uploadFileDetails = await getStorageFileDetails(
          uploadFileId,
          uploadFile.fileName
        )
        uploadFileHash = uploadFileDetails.md5Hash
        canonicalUrl = uploadFile.url
        itemType = itemTypeForContentType(uploadFile.contentType)
        title = titleForFilePath(uploadFile.url)
      } else if (
        source !== 'puppeteer-parse' &&
        FORCE_PUPPETEER_URLS.some((regex) => regex.test(url))
      ) {
        await createPageSaveRequest({
          user: userData,
          url,
          state: state || undefined,
          labels: inputLabels || undefined,
          folder: folder || undefined,
          savedAt,
          publishedAt,
          subscription: rssFeedUrl || undefined,
        })
        return DUMMY_RESPONSE
      } else if (!skipParsing && preparedDocument?.document) {
        const parseResults = await traceAs<Promise<ParsedContentPuppeteer>>(
          { spanName: 'article.parse' },
          async (): Promise<ParsedContentPuppeteer> => {
            return parsePreparedContent(url, preparedDocument)
          }
        )
        parsedContent = parseResults.parsedContent
        canonicalUrl = parseResults.canonicalUrl
        domContent = parseResults.domContent
        itemType = parseResults.pageType
      } else if (!preparedDocument?.document) {
        // We have a URL but no document, so we try to send this to puppeteer
        // and return a dummy response.
        await createPageSaveRequest({
          user: userData,
          url,
          state: state || undefined,
          labels: inputLabels || undefined,
          folder: folder || undefined,
          savedAt,
          publishedAt,
          subscription: rssFeedUrl || undefined,
        })
        return DUMMY_RESPONSE
      }

      const slug = generateSlug(parsedContent?.title || croppedPathname)
      const libraryItemToSave = parsedContentToLibraryItem({
        url,
        title,
        parsedContent,
        userId: uid,
        slug,
        croppedPathname,
        originalHtml: domContent,
        itemType,
        preparedDocument,
        uploadFileHash,
        canonicalUrl,
        uploadFileId,
        state,
        folder,
        publishedAt,
        rssFeedUrl,
        savedAt,
      })

      log.info('New article saving', {
        parsedArticle: Object.assign({}, libraryItemToSave, {
          readableContent: undefined,
          originalContent: undefined,
        }),
      })

      if (uploadFileId) {
        const uploadFileData = await setFileUploadComplete(uploadFileId)
        if (!uploadFileData || !uploadFileData.id || !uploadFileData.fileName) {
          return errorHandler(
            {
              errorCodes: [CreateArticleErrorCode.UploadFileMissing],
            },
            uid,
            articleSavingRequestId,
            pubsub
          )
        }
      }

      // create new item in database
      const libraryItemToReturn = await createOrUpdateLibraryItem(
        libraryItemToSave,
        uid,
        pubsub
      )

      await createAndSaveLabelsInLibraryItem(
        libraryItemToReturn.id,
        uid,
        inputLabels,
        rssFeedUrl
      )

      return {
        user,
        created: true,
        createdArticle: libraryItemToArticle(libraryItemToReturn),
      }
    } catch (error) {
      log.error('Error creating article', error)
      return errorHandler(
        {
          errorCodes: [CreateArticleErrorCode.ElasticError],
        },
        uid,
        articleSavingRequestId,
        pubsub
      )
    }
  }
)

export const getArticleResolver = authorized<
  ArticleSuccess,
  ArticleError,
  QueryArticleArgs
>(async (_obj, { slug, format }, { authTrx, uid, log }, info) => {
  try {
    const selectColumns = getColumns(libraryItemRepository)
    const includeOriginalHtml =
      format === ArticleFormat.Distiller ||
      !!graphqlFields(info).article.originalHtml
    if (!includeOriginalHtml) {
      selectColumns.splice(selectColumns.indexOf('originalContent'), 1)
    }
    // We allow the backend to use the ID instead of a slug to fetch the article
    // query against id if slug is a uuid
    const where = slug.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i)
      ? { id: slug }
      : { slug }
    const libraryItem = await authTrx((tx) =>
      tx.withRepository(libraryItemRepository).findOne({
        select: selectColumns,
        where: {
          ...where,
          deletedAt: IsNull(),
        },
        relations: {
          highlights: {
            user: true,
            labels: true,
          },
          uploadFile: true,
          recommendations: {
            recommender: true,
            group: true,
          },
        },
      })
    )

    if (!libraryItem) {
      return { errorCodes: [ArticleErrorCode.NotFound] }
    }

    if (isParsingTimeout(libraryItem)) {
      libraryItem.readableContent = UNPARSEABLE_CONTENT
    }

    if (format === ArticleFormat.Markdown) {
      libraryItem.readableContent = htmlToMarkdown(libraryItem.readableContent)
    } else if (format === ArticleFormat.Distiller) {
      if (!libraryItem.originalContent) {
        return { errorCodes: [ArticleErrorCode.BadData] }
      }
      const distillerResult = await getDistillerResult(
        uid,
        libraryItem.originalContent
      )
      if (!distillerResult) {
        return { errorCodes: [ArticleErrorCode.BadData] }
      }
      libraryItem.readableContent = distillerResult
    }

    return {
      article: libraryItemToArticle(libraryItem),
    }
  } catch (error) {
    log.error(error)
    return { errorCodes: [ArticleErrorCode.BadData] }
  }
})

// type PaginatedPartialArticles = {
//   edges: { cursor: string; node: PartialArticle }[]
//   pageInfo: PageInfo
// }

// export type SetShareArticleSuccessPartial = Merge<
//   SetShareArticleSuccess,
//   {
//     updatedFeedArticle?: Omit<
//       FeedArticle,
//       | 'sharedBy'
//       | 'article'
//       | 'highlightsCount'
//       | 'annotationsCount'
//       | 'reactions'
//     >
//     updatedFeedArticleId?: string
//     updatedArticle: PartialArticle
//   }
// >

// export const setShareArticleResolver = authorized<
//   SetShareArticleSuccessPartial,
//   SetShareArticleError,
//   MutationSetShareArticleArgs
// >(
//   async (
//     _,
//     { input: { articleID, share, sharedComment, sharedWithHighlights } },
//     { models, authTrx, claims: { uid }, log }
//   ) => {
//     const article = await models.article.get(articleID)
//     if (!article) {
//       return { errorCodes: [SetShareArticleErrorCode.NotFound] }
//     }

//     const sharedAt = share ? new Date() : null

//     log.info(`${share ? 'S' : 'Uns'}haring an article`, {
//       article: Object.assign({}, article, {
//         content: undefined,
//         originalHtml: undefined,
//         sharedAt,
//       }),
//       labels: {
//         source: 'resolver',
//         resolver: 'setShareArticleResolver',
//         articleId: article.id,
//         distinctId: uid,
//       },
//     })

//     const result = await authTrx((tx) =>
//       models.userArticle.updateByArticleId(
//         uid,
//         articleID,
//         { sharedAt, sharedComment, sharedWithHighlights },
//         tx
//       )
//     )

//     if (!result) {
//       return { errorCodes: [SetShareArticleErrorCode.NotFound] }
//     }

//     // Make sure article.id instead of userArticle.id has passed. We use it for cache updates
//     const updatedArticle = {
//       ...result,
//       ...article,
//       postedByViewer: !!sharedAt,
//     }
//     const updatedFeedArticle = sharedAt ? { ...result, sharedAt } : undefined
//     return {
//       updatedFeedArticleId: result.id,
//       updatedFeedArticle,
//       updatedArticle,
//     }
//   }
// )

export const setBookmarkArticleResolver = authorized<
  SetBookmarkArticleSuccess,
  SetBookmarkArticleError,
  MutationSetBookmarkArticleArgs
>(async (_, { input: { articleID } }, { uid, log, pubsub }) => {
  if (!articleID) {
    return { errorCodes: [SetBookmarkArticleErrorCode.NotFound] }
  }

  // delete the item and its metadata
  const deletedLibraryItem = await softDeleteLibraryItem(articleID, uid, pubsub)

  analytics.capture({
    distinctId: uid,
    event: 'link_removed',
    properties: {
      id: articleID,
      env: env.server.apiEnv,
    },
  })

  log.info('Article unbookmarked', {
    item: Object.assign({}, deletedLibraryItem, {
      readableContent: undefined,
      originalContent: undefined,
    }),
  })
  // Make sure article.id instead of userArticle.id has passed. We use it for cache updates
  return {
    bookmarkedArticle: libraryItemToArticle(deletedLibraryItem),
  }
})

export const saveArticleReadingProgressResolver = authorized<
  SaveArticleReadingProgressSuccess,
  SaveArticleReadingProgressError,
  MutationSaveArticleReadingProgressArgs
>(
  async (
    _,
    {
      input: {
        id,
        readingProgressPercent,
        readingProgressAnchorIndex,
        readingProgressTopPercent,
        force,
      },
    },
    { authTrx, pubsub, uid, dataSources }
  ) => {
    if (
      readingProgressPercent < 0 ||
      readingProgressPercent > 100 ||
      (readingProgressTopPercent &&
        (readingProgressTopPercent < 0 ||
          readingProgressTopPercent > readingProgressPercent)) ||
      (readingProgressAnchorIndex && readingProgressAnchorIndex < 0)
    ) {
      return { errorCodes: [SaveArticleReadingProgressErrorCode.BadData] }
    }

    // We don't need to update the values of reading progress here
    // because the function resolver will handle that for us when
    // it resolves the properties of the Article object
    let updatedItem = await authTrx((tx) =>
      tx.getRepository(LibraryItem).findOne({
        where: {
          id,
        },
        relations: ['user'],
      })
    )
    if (!updatedItem) {
      return {
        errorCodes: [SaveArticleReadingProgressErrorCode.Unauthorized],
      }
    }

    if (env.redis.cache && env.redis.mq) {
      if (force) {
        // clear any cached values.
        await clearCachedReadingPosition(uid, id)
      }

      // If redis caching and queueing are available we delay this write
      const updatedProgress =
        await dataSources.readingProgress.updateReadingProgress(uid, id, {
          readingProgressPercent,
          readingProgressTopPercent: readingProgressTopPercent ?? undefined,
          readingProgressAnchorIndex: readingProgressAnchorIndex ?? undefined,
        })
      if (updatedProgress) {
        updatedItem.readAt = new Date()
        updatedItem.readingProgressBottomPercent =
          updatedProgress.readingProgressPercent
        updatedItem.readingProgressTopPercent =
          updatedProgress.readingProgressTopPercent || 0
        updatedItem.readingProgressHighestReadAnchor =
          updatedProgress.readingProgressAnchorIndex || 0
      }
    } else {
      if (force) {
        // update reading progress without checking the current value
        updatedItem = await updateLibraryItem(
          id,
          {
            readingProgressBottomPercent: readingProgressPercent,
            readingProgressTopPercent: readingProgressTopPercent ?? undefined,
            readingProgressHighestReadAnchor:
              readingProgressAnchorIndex ?? undefined,
            readAt: new Date(),
          },
          uid,
          pubsub
        )
      } else {
        updatedItem = await updateLibraryItemReadingProgress(
          id,
          uid,
          readingProgressPercent,
          readingProgressTopPercent,
          readingProgressAnchorIndex
        )

        if (!updatedItem) {
          return {
            errorCodes: [SaveArticleReadingProgressErrorCode.BadData],
          }
        }
      }
    }

    return {
      updatedArticle: libraryItemToArticle(updatedItem),
    }
  }
)

export const searchResolver = authorized<
  SearchSuccess,
  SearchError,
  QuerySearchArgs
>(async (_obj, params, { log, uid }) => {
  const startCursor = params.after || ''
  const first = Math.min(params.first || 10, 100) // limit to 100 items

  // the query size is limited to 255 characters
  if (params.query && params.query.length > 255) {
    return { errorCodes: [SearchErrorCode.QueryTooLong] }
  }

  const { libraryItems, count } = await searchLibraryItems(
    {
      from: Number(startCursor),
      size: first + 1, // fetch one more item to get next cursor
      includePending: true,
      includeContent: !!params.includeContent,
      includeDeleted: params.query?.includes('in:trash'),
      query: params.query,
      useFolders: params.query?.includes('use:folders'),
    },
    uid
  )

  const start =
    startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
  const hasNextPage = libraryItems.length > first
  const endCursor = String(start + libraryItems.length - (hasNextPage ? 1 : 0))

  if (hasNextPage) {
    // remove an extra if exists
    libraryItems.pop()
  }

  const edges = await Promise.all(
    libraryItems.map(async (libraryItem) => {
      libraryItem.highlights = await findHighlightsByLibraryItemId(
        libraryItem.id,
        uid
      )

      if (params.includeContent && libraryItem.readableContent) {
        // convert html to the requested format
        const format = params.format || ArticleFormat.Html
        try {
          const converter = contentConverter(format)
          if (converter) {
            libraryItem.readableContent = converter(
              libraryItem.readableContent,
              libraryItem.highlights
            )
          }
        } catch (error) {
          log.error('Error converting content', error)
        }
      }

      return {
        node: libraryItemToSearchItem(libraryItem),
        cursor: endCursor,
      }
    })
  )

  return {
    edges,
    pageInfo: {
      hasPreviousPage: false,
      startCursor,
      hasNextPage,
      endCursor,
      totalCount: count,
    },
  }
})

export const typeaheadSearchResolver = authorized<
  TypeaheadSearchSuccess,
  TypeaheadSearchError,
  QueryTypeaheadSearchArgs
>(async (_obj, { query, first }, { log, uid }) => {
  try {
    const items = await findLibraryItemsByPrefix(query, uid, first || undefined)

    return {
      items: items.map((item) => ({
        ...item,
        contentReader: item.contentReader as unknown as ContentReader,
      })),
    }
  } catch (error) {
    log.error('typeaheadSearchResolver error', error)
    return { errorCodes: [TypeaheadSearchErrorCode.Unauthorized] }
  }
})

export const updatesSinceResolver = authorized<
  UpdatesSinceSuccess,
  UpdatesSinceError,
  QueryUpdatesSinceArgs
>(async (_obj, { since, first, after, sort: sortParams, folder }, { uid }) => {
  const startCursor = after || ''
  const size = Math.min(first || 10, 100) // limit to 100 items
  let startDate = new Date(since)
  if (isNaN(startDate.getTime())) {
    // for android app compatibility
    startDate = new Date(0)
  }
  const sort = sortParamsToSort(sortParams)

  // create a search query
  const query = `updated:${startDate.toISOString()}${
    folder ? ' in:' + folder : ''
  } sort:${sort.by}-${sort.order}`

  const { libraryItems, count } = await searchLibraryItems(
    {
      from: Number(startCursor),
      size: size + 1, // fetch one more item to get next cursor
      includeDeleted: true,
      query,
    },
    uid
  )

  const start =
    startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
  const hasNextPage = libraryItems.length > size
  const endCursor = String(start + libraryItems.length - (hasNextPage ? 1 : 0))

  //TODO: refactor so that the lastCursor included
  if (hasNextPage) {
    // remove an extra if exists
    libraryItems.pop()
  }

  const edges = libraryItems.map((item) => {
    const updateReason = getUpdateReason(item, startDate)
    return {
      node: libraryItemToSearchItem(item),
      cursor: endCursor,
      itemID: item.id,
      updateReason,
    }
  })

  return {
    edges,
    pageInfo: {
      hasPreviousPage: false,
      startCursor,
      hasNextPage,
      endCursor,
      totalCount: count,
    },
  }
})

export const bulkActionResolver = authorized<
  BulkActionSuccess,
  BulkActionError,
  MutationBulkActionArgs
>(
  async (
    _parent,
    { query, action, labelIds, arguments: args }, // arguments is a reserved keyword in JS
    { uid, log }
  ) => {
    try {
      analytics.capture({
        distinctId: uid,
        event: 'BulkAction',
        properties: {
          env: env.server.apiEnv,
          action,
        },
      })

      const batchSize = 100
      const searchArgs = {
        query,
        size: 0,
      }
      const count = await countLibraryItems(searchArgs, uid)
      if (count === 0) {
        log.info('No items found for bulk action')
        return { success: true }
      }

      if (count <= batchSize) {
        searchArgs.size = count
        log.info('Bulk action: updating items synchronously', {
          query,
          action,
          count,
        })
        // if there are less than 100 items, update them synchronously
        await batchUpdateLibraryItems(action, searchArgs, uid, labelIds, args)

        return { success: true }
      }

      // if there are more than 100 items, update them asynchronously
      const data = {
        userId: uid,
        action,
        labelIds: labelIds || undefined,
        query,
        count,
        args,
        batchSize,
      }
      log.info('enqueue bulk action job', data)
      const job = await enqueueBulkAction(data)
      if (!job) {
        return { errorCodes: [BulkActionErrorCode.BadRequest] }
      }

      return { success: true }
    } catch (error) {
      log.error('bulkActionResolver error', error)
      return { errorCodes: [BulkActionErrorCode.BadRequest] }
    }
  }
)

export const setFavoriteArticleResolver = authorized<
  SetFavoriteArticleSuccess,
  SetFavoriteArticleError,
  MutationSetFavoriteArticleArgs
>(async (_, { id }, { uid, log }) => {
  try {
    analytics.capture({
      distinctId: uid,
      event: 'setFavoriteArticle',
      properties: {
        env: env.server.apiEnv,
        id,
      },
    })

    const label = getInternalLabelWithColor('Favorites')
    if (!label) {
      return { errorCodes: [SetFavoriteArticleErrorCode.BadRequest] }
    }

    const labels = await findOrCreateLabels([label], uid)
    // adds Favorites label to item
    await addLabelsToLibraryItem(
      labels.map((l) => l.id),
      id,
      uid,
      'user'
    )

    return {
      success: true,
    }
  } catch (error) {
    log.info('Error adding Favorites label', error)
    return { errorCodes: [SetFavoriteArticleErrorCode.BadRequest] }
  }
})

export const moveToFolderResolver = authorized<
  MoveToFolderSuccess,
  MoveToFolderError,
  MutationMoveToFolderArgs
>(async (_, { id, folder }, { authTrx, log, pubsub, uid }) => {
  analytics.capture({
    distinctId: uid,
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

  await updateLibraryItem(
    item.id,
    {
      folder,
      savedAt,
    },
    uid,
    pubsub
  )

  // if the content is not fetched yet, create a page save request
  if (item.state === LibraryItemState.ContentNotFetched) {
    try {
      await createPageSaveRequest({
        user: item.user,
        url: item.originalUrl,
        articleSavingRequestId: id,
        priority: 'high',
        publishedAt: item.publishedAt || undefined,
        savedAt,
        folder,
        pubsub,
      })
    } catch (error) {
      log.error('moveToFolderResolver error', error)

      return {
        errorCodes: [MoveToFolderErrorCode.BadRequest],
      }
    }
  }

  return {
    success: true,
  }
})

export const fetchContentResolver = authorized<
  FetchContentSuccess,
  FetchContentError,
  MutationFetchContentArgs
>(async (_, { id }, { authTrx, uid, log, pubsub }) => {
  analytics.capture({
    distinctId: uid,
    event: 'fetch_content',
    properties: {
      id,
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
      errorCodes: [FetchContentErrorCode.Unauthorized],
    }
  }

  // if the content is not fetched yet, create a page save request
  if (item.state === LibraryItemState.ContentNotFetched) {
    try {
      await createPageSaveRequest({
        user: item.user,
        url: item.originalUrl,
        articleSavingRequestId: id,
        priority: 'high',
        pubsub,
      })
    } catch (error) {
      log.error('fetchContentResolver error', error)

      return {
        errorCodes: [FetchContentErrorCode.BadRequest],
      }
    }
  }

  return {
    success: true,
  }
})

export const emptyTrashResolver = authorized<
  EmptyTrashSuccess,
  EmptyTrashError
>(async (_, __, { uid }) => {
  analytics.capture({
    distinctId: uid,
    event: 'empty_trash',
  })

  await batchDelete({
    state: LibraryItemState.Deleted,
    user: {
      id: uid,
    },
  })

  return {
    success: true,
  }
})

const getUpdateReason = (libraryItem: LibraryItem, since: Date) => {
  if (libraryItem.deletedAt) {
    return UpdateReason.Deleted
  }
  if (libraryItem.createdAt >= since) {
    return UpdateReason.Created
  }
  return UpdateReason.Updated
}
