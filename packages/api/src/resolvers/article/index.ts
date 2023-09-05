/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Readability } from '@omnivore/readability'
import graphqlFields from 'graphql-fields'
import {
  LibraryItem,
  LibraryItemState,
  LibraryItemType,
} from '../../entity/library_item'
import { env } from '../../env'
import {
  Article,
  ArticleError,
  ArticleErrorCode,
  ArticleSavingRequestStatus,
  ArticleSuccess,
  BulkActionError,
  BulkActionErrorCode,
  BulkActionSuccess,
  BulkActionType,
  ContentReader,
  CreateArticleError,
  CreateArticleErrorCode,
  CreateArticleSuccess,
  FeedArticle,
  MutationBulkActionArgs,
  MutationCreateArticleArgs,
  MutationSaveArticleReadingProgressArgs,
  MutationSetBookmarkArticleArgs,
  MutationSetFavoriteArticleArgs,
  PageInfo,
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
  SetShareArticleSuccess,
  TypeaheadSearchError,
  TypeaheadSearchErrorCode,
  TypeaheadSearchSuccess,
  UpdateReason,
  UpdatesSinceError,
  UpdatesSinceSuccess,
} from '../../generated/graphql'
import { getInternalLabelWithColor } from '../../repository/label'
import { libraryItemRepository } from '../../repository/library_item'
import { userRepository } from '../../repository/user'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import {
  addLabelsToLibraryItem,
  findLabelsByIds,
  getLabelsAndCreateIfNotExist,
} from '../../services/labels'
import {
  createLibraryItem,
  findLibraryItemById,
  findLibraryItemByUrl,
  findLibraryItemsByPrefix,
  searchLibraryItems,
  updateLibraryItem,
  updateLibraryItems,
} from '../../services/library_item'
import { parsedContentToLibraryItem } from '../../services/save_page'
import {
  findUploadFileById,
  setFileUploadComplete,
} from '../../services/upload_file'
import { traceAs } from '../../tracing'
import { Merge } from '../../util'
import { analytics } from '../../utils/analytics'
import { isSiteBlockedForParse } from '../../utils/blocked'
import {
  authorized,
  cleanUrl,
  generateSlug,
  isBase64Image,
  isParsingTimeout,
  libraryItemToPartialArticle,
  libraryItemToSearchItem,
  pageError,
  titleForFilePath,
  userDataToUser,
} from '../../utils/helpers'
import { createImageProxyUrl } from '../../utils/imageproxy'
import {
  contentConverter,
  getDistillerResult,
  htmlToMarkdown,
  ParsedContentPuppeteer,
  parsePreparedContent,
} from '../../utils/parser'
import { parseSearchQuery, sortParamsToSort } from '../../utils/search'
import {
  getStorageFileDetails,
  makeStorageFilePublic,
} from '../../utils/uploads'
import { itemTypeForContentType } from '../upload_files'

export enum ArticleFormat {
  Markdown = 'markdown',
  Html = 'html',
  Distiller = 'distiller',
  HighlightedMarkdown = 'highlightedMarkdown',
}

export type PartialArticle = Omit<
  Article,
  | 'updatedAt'
  | 'readingProgressPercent'
  | 'readingProgressAnchorIndex'
  | 'savedAt'
  | 'highlights'
  | 'contentReader'
>

// These two page types are better handled by the backend
// where we can use APIs to fetch their underlying content.
const FORCE_PUPPETEER_URLS = [
  // twitter status url regex
  /twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?/,
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/,
]
const UNPARSEABLE_CONTENT = '<p>We were unable to parse this page.</p>'

export type CreateArticlesSuccessPartial = Merge<
  CreateArticleSuccess,
  { createdArticle: PartialArticle }
>
export const createArticleResolver = authorized<
  CreateArticlesSuccessPartial,
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
      return pageError(
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
        return pageError(
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
      let userArticleUrl: string | null = null
      let uploadFileHash = null
      let domContent = null
      let itemType = LibraryItemType.Unknown

      const DUMMY_RESPONSE = {
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
          pageType: itemType as unknown as PageType,
          contentReader: ContentReader.Web,
          author: '',
          url,
          hash: '',
          isArchived: false,
        },
      }

      if (uploadFileId) {
        /* We do not trust the values from client, lookup upload file by querying
         * with filtering on user ID and URL to verify client's uploadFileId is valid.
         */
        const uploadFile = await findUploadFileById(uploadFileId)
        if (!uploadFile) {
          return pageError(
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
        userArticleUrl = uploadFileDetails.fileUrl
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
        itemType = parseResults.pageType as unknown as LibraryItemType
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
        itemId: articleSavingRequestId,
        slug,
        croppedPathname,
        originalHtml: domContent,
        itemType,
        preparedDocument,
        uploadFileHash,
        canonicalUrl,
        uploadFileId,
      })

      log.info('New article saving', {
        parsedArticle: Object.assign({}, libraryItemToSave, {
          content: undefined,
          originalHtml: undefined,
        }),
        userArticleUrl,
        labels: {
          source: 'resolver',
          resolver: 'createArticleResolver',
          userId: uid,
        },
      })

      if (uploadFileId) {
        const uploadFileData = await setFileUploadComplete(uploadFileId)
        if (!uploadFileData || !uploadFileData.id || !uploadFileData.fileName) {
          return pageError(
            {
              errorCodes: [CreateArticleErrorCode.UploadFileMissing],
            },
            uid,
            articleSavingRequestId,
            pubsub
          )
        }
        await makeStorageFilePublic(uploadFileData.id, uploadFileData.fileName)
      }

      // save page's state and labels
      libraryItemToSave.archivedAt =
        state === ArticleSavingRequestStatus.Archived ? new Date() : null
      if (inputLabels) {
        libraryItemToSave.labels = await getLabelsAndCreateIfNotExist(
          inputLabels,
          uid
        )
      }

      let libraryItemToReturn: LibraryItem

      const existingLibraryItem = await findLibraryItemByUrl(
        libraryItemToSave.originalUrl,
        uid
      )
      articleSavingRequestId = existingLibraryItem?.id || articleSavingRequestId
      if (articleSavingRequestId) {
        // update existing page's state from processing to succeeded
        libraryItemToReturn = await updateLibraryItem(
          articleSavingRequestId,
          libraryItemToSave,
          uid,
          pubsub
        )
      } else {
        // create new page in elastic
        libraryItemToReturn = await createLibraryItem(
          libraryItemToSave,
          uid,
          pubsub
        )
      }

      log.info(
        'page created in elastic',
        libraryItemToReturn.id,
        libraryItemToReturn.originalUrl,
        libraryItemToReturn.slug,
        libraryItemToReturn.title
      )

      return {
        user,
        created: true,
        createdArticle: libraryItemToPartialArticle(libraryItemToReturn),
      }
    } catch (error) {
      log.error('Error creating article', error)
      return pageError(
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

export type ArticleSuccessPartial = Merge<
  ArticleSuccess,
  { article: PartialArticle }
>
export const getArticleResolver = authorized<
  ArticleSuccessPartial,
  ArticleError,
  QueryArticleArgs
>(async (_obj, { slug, format }, { authTrx, uid, log }, info) => {
  try {
    const includeOriginalHtml =
      format === ArticleFormat.Distiller ||
      !!graphqlFields(info).article.originalHtml

    // We allow the backend to use the ID instead of a slug to fetch the article
    const libraryItem = await authTrx((tx) =>
      tx
        .withRepository(libraryItemRepository)
        .createQueryBuilder('library_item')
        .leftJoinAndSelect('library_item.labels', 'labels')
        .leftJoinAndSelect('library_item.highlights', 'highlights')
        .where('library_item.id = :id', { id: slug })
        .getOne()
    )

    if (!libraryItem || libraryItem.state === LibraryItemState.Deleted) {
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
      article: libraryItemToPartialArticle(libraryItem),
    }
  } catch (error) {
    log.error(error)
    return { errorCodes: [ArticleErrorCode.BadData] }
  }
})

type PaginatedPartialArticles = {
  edges: { cursor: string; node: PartialArticle }[]
  pageInfo: PageInfo
}

export type SetShareArticleSuccessPartial = Merge<
  SetShareArticleSuccess,
  {
    updatedFeedArticle?: Omit<
      FeedArticle,
      | 'sharedBy'
      | 'article'
      | 'highlightsCount'
      | 'annotationsCount'
      | 'reactions'
    >
    updatedFeedArticleId?: string
    updatedArticle: PartialArticle
  }
>

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

export type SetBookmarkArticleSuccessPartial = Merge<
  SetBookmarkArticleSuccess,
  { bookmarkedArticle: PartialArticle }
>
export const setBookmarkArticleResolver = authorized<
  SetBookmarkArticleSuccessPartial,
  SetBookmarkArticleError,
  MutationSetBookmarkArticleArgs
>(async (_, { input: { articleID } }, { uid, log, pubsub }) => {
  // delete the page and its metadata
  const deletedLibraryItem = await updateLibraryItem(
    articleID,
    {
      state: LibraryItemState.Deleted,
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
    page: Object.assign({}, deletedLibraryItem, {
      readableContent: undefined,
      originalContent: undefined,
    }),
    labels: {
      source: 'resolver',
      resolver: 'setBookmarkArticleResolver',
      userId: uid,
      articleID,
    },
  })
  // Make sure article.id instead of userArticle.id has passed. We use it for cache updates
  return {
    bookmarkedArticle: libraryItemToPartialArticle(deletedLibraryItem),
  }
})

export type SaveArticleReadingProgressSuccessPartial = Merge<
  SaveArticleReadingProgressSuccess,
  { updatedArticle: PartialArticle }
>
export const saveArticleReadingProgressResolver = authorized<
  SaveArticleReadingProgressSuccessPartial,
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
      },
    },
    { uid, pubsub }
  ) => {
    const libraryItem = await findLibraryItemById(id, uid)

    if (!libraryItem) {
      return { errorCodes: [SaveArticleReadingProgressErrorCode.NotFound] }
    }

    if (
      readingProgressPercent < 0 ||
      readingProgressPercent > 100 ||
      (readingProgressTopPercent &&
        (readingProgressTopPercent < 0 ||
          readingProgressTopPercent > readingProgressPercent)) ||
      readingProgressAnchorIndex < 0
    ) {
      return { errorCodes: [SaveArticleReadingProgressErrorCode.BadData] }
    }
    // If we have a top percent, we only save it if it's greater than the current top percent
    // or set to zero if the top percent is zero.
    const readingProgressTopPercentToSave = readingProgressTopPercent
      ? Math.max(
          readingProgressTopPercent,
          libraryItem.readingProgressTopPercent || 0
        )
      : readingProgressTopPercent === 0
      ? 0
      : undefined
    // If setting to zero we accept the update, otherwise we require it
    // be greater than the current reading progress.
    const updatedPart = {
      readingProgressBottomPercent:
        readingProgressPercent === 0
          ? 0
          : Math.max(
              readingProgressPercent,
              libraryItem.readingProgressTopPercent
            ),
      readingProgressHighestReadAnchor:
        readingProgressAnchorIndex === 0
          ? 0
          : Math.max(
              readingProgressAnchorIndex,
              libraryItem.readingProgressHighestReadAnchor
            ),
      readingProgressTopPercent: readingProgressTopPercentToSave,
      readAt: new Date(),
    }
    const updatedItem = await updateLibraryItem(id, updatedPart, uid, pubsub)

    return {
      updatedArticle: libraryItemToPartialArticle(updatedItem),
    }
  }
)

export const searchResolver = authorized<
  SearchSuccess,
  SearchError,
  QuerySearchArgs
>(async (_obj, params, { uid, log }) => {
  const startCursor = params.after || ''
  const first = params.first || 10

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
      includeContent: params.includeContent ?? false,
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

  const edges = libraryItems.map((libraryItem) => {
    if (libraryItem.siteIcon && !isBase64Image(libraryItem.siteIcon)) {
      libraryItem.siteIcon = createImageProxyUrl(libraryItem.siteIcon, 128, 128)
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

  return {
    edges,
    pageInfo: {
      hasPreviousPage: false,
      startCursor,
      hasNextPage: hasNextPage,
      endCursor,
      totalCount: count,
    },
  }
})

export const typeaheadSearchResolver = authorized<
  TypeaheadSearchSuccess,
  TypeaheadSearchError,
  QueryTypeaheadSearchArgs
>(async (_obj, { query, first }, { log }) => {
  try {
    const items = await findLibraryItemsByPrefix(query, first || undefined)

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
>(async (_obj, { since, first, after, sort: sortParams }, { uid }) => {
  const sort = sortParamsToSort(sortParams)

  const startCursor = after || ''
  const size = first || 10
  const startDate = new Date(since)
  const { libraryItems, count } = await searchLibraryItems(
    {
      from: Number(startCursor),
      size: size + 1, // fetch one more item to get next cursor
      includeDeleted: true,
      dateFilters: [{ field: 'updatedAt', startDate }],
      sort,
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

    // get labels if needed
    let labels = undefined
    if (action === BulkActionType.AddLabels) {
      if (!labelIds || labelIds.length === 0) {
        return { errorCodes: [BulkActionErrorCode.BadRequest] }
      }

      labels = await findLabelsByIds(labelIds)
    }

    // parse query
    const searchQuery = parseSearchQuery(query)

    await updateLibraryItems(action, searchQuery, labels)

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

    const labels = await getLabelsAndCreateIfNotExist([label], uid)
    // adds Favorites label to page
    await addLabelsToLibraryItem(labels, id, uid)

    return {
      success: true,
    }
  } catch (error) {
    log.info('Error adding Favorites label', error)
    return { errorCodes: [SetFavoriteArticleErrorCode.BadRequest] }
  }
})

const getUpdateReason = (libraryItem: LibraryItem, since: Date) => {
  if (libraryItem.state === LibraryItemState.Deleted) {
    return UpdateReason.Deleted
  }
  if (libraryItem.createdAt >= since) {
    return UpdateReason.Created
  }
  return UpdateReason.Updated
}
