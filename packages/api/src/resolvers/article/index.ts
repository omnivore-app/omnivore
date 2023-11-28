/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Readability } from '@omnivore/readability'
import graphqlFields from 'graphql-fields'
import { IsNull } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { LibraryItem, LibraryItemState } from '../../entity/library_item'
import { env } from '../../env'
import {
  ArticleError,
  ArticleErrorCode,
  ArticleSuccess,
  BulkActionError,
  BulkActionErrorCode,
  BulkActionSuccess,
  BulkActionType,
  ContentReader,
  CreateArticleError,
  CreateArticleErrorCode,
  CreateArticleSuccess,
  MoveToFolderError,
  MoveToFolderErrorCode,
  MoveToFolderSuccess,
  MutationBulkActionArgs,
  MutationCreateArticleArgs,
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
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { findHighlightsByLibraryItemId } from '../../services/highlights'
import {
  addLabelsToLibraryItem,
  findLabelsByIds,
  findOrCreateLabels,
  saveLabelsInLibraryItem,
} from '../../services/labels'
import {
  createLibraryItem,
  findLibraryItemByUrl,
  findLibraryItemsByPrefix,
  searchLibraryItems,
  updateLibraryItem,
  updateLibraryItemReadingProgress,
  updateLibraryItems,
} from '../../services/library_item'
import { parsedContentToLibraryItem } from '../../services/save_page'
import {
  findUploadFileById,
  setFileUploadComplete,
} from '../../services/upload_file'
import { traceAs } from '../../tracing'
import { analytics } from '../../utils/analytics'
import { isSiteBlockedForParse } from '../../utils/blocked'
import {
  authorized,
  cleanUrl,
  errorHandler,
  generateSlug,
  isParsingTimeout,
  libraryItemToArticle,
  libraryItemToArticleSavingRequest,
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
import {
  InFilter,
  parseSearchQuery,
  sortParamsToSort,
} from '../../utils/search'
import { getStorageFileDetails } from '../../utils/uploads'
import { itemTypeForContentType } from '../upload_files'

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
      },
    },
    { log, uid, pubsub }
  ) => {
    analytics.track({
      userId: uid,
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
          savedAt: new Date(),
          updatedAt: new Date(),
          folder: '',
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
          userId: uid,
          url,
          state: state || undefined,
          labels: inputLabels || undefined,
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
          userId: uid,
          url,
          state: state || undefined,
          labels: inputLabels || undefined,
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

      let libraryItemToReturn: LibraryItem

      const existingLibraryItem = await findLibraryItemByUrl(
        libraryItemToSave.originalUrl,
        uid
      )
      articleSavingRequestId = existingLibraryItem?.id || articleSavingRequestId
      if (articleSavingRequestId) {
        // update existing item's state from processing to succeeded
        libraryItemToReturn = await updateLibraryItem(
          articleSavingRequestId,
          libraryItemToSave as QueryDeepPartialEntity<LibraryItem>,
          uid,
          pubsub
        )
      } else {
        // create new item in database
        libraryItemToReturn = await createLibraryItem(
          libraryItemToSave,
          uid,
          pubsub
        )
      }

      // save labels in item
      if (inputLabels) {
        const labels = await findOrCreateLabels(inputLabels, user.id)
        await saveLabelsInLibraryItem(labels, libraryItemToReturn.id, user.id)
      }

      log.info(
        'item created in database',
        libraryItemToReturn.id,
        libraryItemToReturn.originalUrl,
        libraryItemToReturn.slug,
        libraryItemToReturn.title
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
          labels: true,
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
//         userId: uid,
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
  // delete the item and its metadata
  const deletedLibraryItem = await updateLibraryItem(
    articleID,
    {
      state: LibraryItemState.Deleted,
      deletedAt: new Date(),
    },
    uid,
    pubsub
  )

  analytics.track({
    userId: uid,
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
    { log, pubsub, uid }
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
    try {
      if (force) {
        // update reading progress without checking the current value
        const updatedItem = await updateLibraryItem(
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

        return {
          updatedArticle: libraryItemToArticle(updatedItem),
        }
      }

      // update reading progress only if the current value is lower
      const updatedItem = await updateLibraryItemReadingProgress(
        id,
        uid,
        readingProgressPercent,
        readingProgressTopPercent,
        readingProgressAnchorIndex,
        pubsub
      )
      if (!updatedItem) {
        return { errorCodes: [SaveArticleReadingProgressErrorCode.BadData] }
      }

      return {
        updatedArticle: libraryItemToArticle(updatedItem),
      }
    } catch (error) {
      log.error('saveArticleReadingProgressResolver error', error)

      return { errorCodes: [SaveArticleReadingProgressErrorCode.Unauthorized] }
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

  const searchQuery = parseSearchQuery(params.query || undefined)

  const { libraryItems, count } = await searchLibraryItems(
    {
      from: Number(startCursor),
      size: first + 1, // fetch one more item to get next cursor
      sort: searchQuery.sort,
      includePending: true,
      includeContent: !!params.includeContent,
      ...searchQuery,
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
      if (
        libraryItem.highlightAnnotations &&
        libraryItem.highlightAnnotations.length > 0
      ) {
        libraryItem.highlights = await findHighlightsByLibraryItemId(
          libraryItem.id,
          uid
        )
      }

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
  const sort = sortParamsToSort(sortParams)

  const startCursor = after || ''
  const size = Math.min(first || 10, 100) // limit to 100 items
  let startDate = new Date(since)
  if (isNaN(startDate.getTime())) {
    // for android app compatibility
    startDate = new Date(0)
  }

  const { libraryItems, count } = await searchLibraryItems(
    {
      from: Number(startCursor),
      size: size + 1, // fetch one more item to get next cursor
      includeDeleted: true,
      dateFilters: [{ field: 'updatedAt', startDate }],
      sort,
      inFilter: (folder as InFilter) || InFilter.ALL,
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
>(async (_parent, { query, action, labelIds }, { uid, log }) => {
  try {
    analytics.track({
      userId: uid,
      event: 'BulkAction',
      properties: {
        env: env.server.apiEnv,
        action,
      },
    })

    // parse query
    const searchQuery = parseSearchQuery(query)
    if (searchQuery.ids.length > 100) {
      return { errorCodes: [BulkActionErrorCode.BadRequest] }
    }

    // get labels if needed
    let labels = undefined
    if (action === BulkActionType.AddLabels) {
      if (!labelIds || labelIds.length === 0) {
        return { errorCodes: [BulkActionErrorCode.BadRequest] }
      }

      labels = await findLabelsByIds(labelIds, uid)
    }

    await updateLibraryItems(action, searchQuery, uid, labels)

    return { success: true }
  } catch (error) {
    log.error('bulkActionResolver error', error)
    return { errorCodes: [BulkActionErrorCode.BadRequest] }
  }
})

export const setFavoriteArticleResolver = authorized<
  SetFavoriteArticleSuccess,
  SetFavoriteArticleError,
  MutationSetFavoriteArticleArgs
>(async (_, { id }, { uid, log }) => {
  try {
    analytics.track({
      userId: uid,
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
    await addLabelsToLibraryItem(labels, id, uid)

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

const getUpdateReason = (libraryItem: LibraryItem, since: Date) => {
  if (libraryItem.deletedAt) {
    return UpdateReason.Deleted
  }
  if (libraryItem.createdAt >= since) {
    return UpdateReason.Created
  }
  return UpdateReason.Updated
}
