/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  Article,
  ArticleError,
  ArticleErrorCode,
  ArticlesError,
  ArticleSuccess,
  ContentReader,
  CreateArticleError,
  CreateArticleErrorCode,
  CreateArticleSuccess,
  FeedArticle,
  MutationCreateArticleArgs,
  MutationSaveArticleReadingProgressArgs,
  MutationSetBookmarkArticleArgs,
  MutationSetShareArticleArgs,
  PageInfo,
  QueryArticleArgs,
  QueryArticlesArgs,
  QuerySearchArgs,
  QueryTypeaheadSearchArgs,
  QueryUpdatesSinceArgs,
  ResolverFn,
  SaveArticleReadingProgressError,
  SaveArticleReadingProgressErrorCode,
  SaveArticleReadingProgressSuccess,
  SearchError,
  SearchItem,
  SearchSuccess,
  SetBookmarkArticleError,
  SetBookmarkArticleErrorCode,
  SetBookmarkArticleSuccess,
  SetShareArticleError,
  SetShareArticleErrorCode,
  SetShareArticleSuccess,
  TypeaheadSearchError,
  TypeaheadSearchErrorCode,
  TypeaheadSearchSuccess,
  UpdateReason,
  UpdatesSinceError,
  UpdatesSinceErrorCode,
  UpdatesSinceSuccess,
} from '../../generated/graphql'
import { Merge } from '../../util'
import {
  getStorageFileDetails,
  makeStorageFilePublic,
} from '../../utils/uploads'
import { ContentParseError } from '../../utils/errors'
import {
  authorized,
  generateSlug,
  isParsingTimeout,
  pageError,
  stringToHash,
  titleForFilePath,
  userDataToUser,
  validatedDate,
  wordsCount,
} from '../../utils/helpers'
import {
  ParsedContentPuppeteer,
  parsePreparedContent,
} from '../../utils/parser'
import { isSiteBlockedForParse } from '../../utils/blocked'
import { Readability } from '@omnivore/readability'
import { traceAs } from '../../tracing'

import { createImageProxyUrl } from '../../utils/imageproxy'
import normalizeUrl from 'normalize-url'
import { WithDataSourcesContext } from '../types'

import { parseSearchQuery, SortBy, SortOrder } from '../../utils/search'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import graphqlFields from 'graphql-fields'

import {
  ArticleSavingRequestStatus,
  Page,
  PageType,
  SearchItem as SearchItemData,
} from '../../elastic/types'
import {
  createPage,
  getPageById,
  getPageByParam,
  searchAsYouType,
  searchPages,
  updatePage,
} from '../../elastic/pages'
import { searchHighlights } from '../../elastic/highlights'
import { saveSearchHistory } from '../../services/search_history'

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
        articleSavingRequestId: pageId,
        uploadFileId,
        skipParsing,
        source,
      },
    },
    ctx
  ) => {
    const {
      models,
      authTrx,
      claims: { uid },
      log,
    } = ctx

    analytics.track({
      userId: uid,
      event: 'link_saved',
      properties: {
        url,
        source,
        env: env.server.apiEnv,
      },
    })

    const user = userDataToUser(await models.user.get(uid))
    try {
      if (isSiteBlockedForParse(url)) {
        return pageError(
          {
            errorCodes: [CreateArticleErrorCode.NotAllowedToParse],
          },
          ctx,
          pageId
        )
      }

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
      let pageType = PageType.Unknown

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
          pageType: PageType.Unknown,
          contentReader: ContentReader.Web,
          author: '',
          url: normalizeUrl(canonicalUrl || url, {
            stripHash: true,
            stripWWW: false,
          }),
          hash: '',
          isArchived: false,
        },
      }

      if (uploadFileId) {
        /* We do not trust the values from client, lookup upload file by querying
         * with filtering on user ID and URL to verify client's uploadFileId is valid.
         */
        const uploadFile = await models.uploadFile.getWhere({
          id: uploadFileId,
          userId: uid,
        })
        if (!uploadFile) {
          return pageError(
            { errorCodes: [CreateArticleErrorCode.UploadFileMissing] },
            ctx,
            pageId
          )
        }
        const uploadFileDetails = await getStorageFileDetails(
          uploadFileId,
          uploadFile.fileName
        )
        uploadFileHash = uploadFileDetails.md5Hash
        userArticleUrl = uploadFileDetails.fileUrl
        canonicalUrl = uploadFile.url
        pageType = PageType.File
        title = titleForFilePath(uploadFile.url)
      } else if (
        source !== 'puppeteer-parse' &&
        FORCE_PUPPETEER_URLS.some((regex) => regex.test(url))
      ) {
        await createPageSaveRequest(uid, url, models)
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
        pageType = parseResults.pageType
      } else if (!preparedDocument?.document) {
        // We have a URL but no document, so we try to send this to puppeteer
        // and return a dummy response.
        await createPageSaveRequest(uid, url, models)
        return DUMMY_RESPONSE
      }

      const saveTime = new Date()
      const slug = generateSlug(parsedContent?.title || croppedPathname)
      const articleToSave: Page = {
        id: pageId || '',
        userId: uid,
        originalHtml: domContent,
        content: parsedContent?.content || '',
        description: parsedContent?.excerpt || '',
        title:
          title ||
          parsedContent?.title ||
          preparedDocument?.pageInfo.title ||
          croppedPathname ||
          parsedContent?.siteName ||
          url,
        author: parsedContent?.byline,
        url: normalizeUrl(canonicalUrl || url, {
          stripHash: true,
          stripWWW: false,
        }),
        pageType: pageType,
        hash: uploadFileHash || stringToHash(parsedContent?.content || url),
        image: parsedContent?.previewImage,
        publishedAt: validatedDate(parsedContent?.publishedDate),
        uploadFileId: uploadFileId,
        slug,
        createdAt: saveTime,
        savedAt: saveTime,
        siteName: parsedContent?.siteName,
        siteIcon: parsedContent?.siteIcon,
        readingProgressPercent: 0,
        readingProgressAnchorIndex: 0,
        state: ArticleSavingRequestStatus.Succeeded,
        language: parsedContent?.language,
        wordsCount: wordsCount(parsedContent?.textContent || ''),
      }

      let archive = false
      if (pageId) {
        const reminder = await models.reminder.getByRequestId(uid, pageId)
        if (reminder) {
          archive = reminder.archiveUntil || false
        }
      }

      log.info('New article saving', {
        parsedArticle: Object.assign({}, articleToSave, {
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

      let uploadFileUrlOverride = ''
      if (uploadFileId) {
        const uploadFileData = await authTrx(async (tx) => {
          return models.uploadFile.setFileUploadComplete(uploadFileId, tx)
        })
        if (!uploadFileData || !uploadFileData.id || !uploadFileData.fileName) {
          return pageError(
            {
              errorCodes: [CreateArticleErrorCode.UploadFileMissing],
            },
            ctx,
            pageId
          )
        }
        uploadFileUrlOverride = await makeStorageFilePublic(
          uploadFileData.id,
          uploadFileData.fileName
        )
      }

      if (
        pageId ||
        (pageId = (
          await getPageByParam({
            userId: uid,
            url: articleToSave.url,
          })
        )?.id)
      ) {
        // update existing page's state from processing to succeeded
        articleToSave.archivedAt = archive ? saveTime : null
        const updated = await updatePage(pageId, articleToSave, {
          ...ctx,
          uid,
        })

        if (!updated) {
          return pageError(
            {
              errorCodes: [CreateArticleErrorCode.ElasticError],
            },
            ctx,
            pageId
          )
        }
      } else {
        // create new page in elastic
        const newPageId = await createPage(articleToSave, { ...ctx, uid })
        if (!newPageId) {
          return pageError(
            {
              errorCodes: [CreateArticleErrorCode.ElasticError],
            },
            ctx,
            pageId
          )
        }
        articleToSave.id = newPageId
      }
      log.info(
        'page created in elastic',
        articleToSave.id,
        articleToSave.url,
        articleToSave.slug,
        articleToSave.title
      )

      const createdArticle: PartialArticle = {
        ...articleToSave,
        isArchived: !!articleToSave.archivedAt,
      }
      return {
        user,
        created: false,
        createdArticle: createdArticle,
      }
    } catch (error) {
      if (
        error instanceof ContentParseError &&
        error.message === 'UNABLE_TO_PARSE'
      ) {
        return pageError(
          { errorCodes: [CreateArticleErrorCode.UnableToParse] },
          ctx,
          pageId
        )
      }
      throw error
    }
  }
)

export type ArticleSuccessPartial = Merge<
  ArticleSuccess,
  { article: PartialArticle }
>
export const getArticleResolver: ResolverFn<
  ArticleSuccessPartial | ArticleError,
  Record<string, unknown>,
  WithDataSourcesContext,
  QueryArticleArgs
> = async (_obj, { slug }, { claims, pubsub }, info) => {
  try {
    if (!claims?.uid) {
      return { errorCodes: [ArticleErrorCode.Unauthorized] }
    }

    const includeOriginalHtml = !!graphqlFields(info).article.originalHtml

    analytics.track({
      userId: claims?.uid,
      event: 'link_fetched',
      properties: {
        slug,
        env: env.server.apiEnv,
      },
    })

    // We allow the backend to use the ID instead of a slug to fetch the article
    const page =
      (await getPageByParam(
        { userId: claims.uid, slug },
        includeOriginalHtml
      )) ||
      (await getPageByParam(
        { userId: claims.uid, _id: slug },
        includeOriginalHtml
      ))

    if (!page) {
      return { errorCodes: [ArticleErrorCode.NotFound] }
    }

    if (isParsingTimeout(page)) {
      page.content = UNPARSEABLE_CONTENT
    }

    return {
      article: { ...page, isArchived: !!page.archivedAt, linkId: page.id },
    }
  } catch (error) {
    console.log(error)
    return { errorCodes: [ArticleErrorCode.BadData] }
  }
}

type PaginatedPartialArticles = {
  edges: { cursor: string; node: PartialArticle }[]
  pageInfo: PageInfo
}

export const getArticlesResolver = authorized<
  PaginatedPartialArticles,
  ArticlesError,
  QueryArticlesArgs
>(async (_obj, params, { claims }) => {
  const startCursor = params.after || ''
  const first = params.first || 10

  const searchQuery = parseSearchQuery(params.query || undefined)

  analytics.track({
    userId: claims.uid,
    event: 'get_articles',
    properties: {
      env: env.server.apiEnv,
      ...searchQuery,
    },
  })

  const [pages, totalCount] = (await searchPages(
    {
      from: Number(startCursor),
      size: first + 1, // fetch one more item to get next cursor
      sort: searchQuery.sortParams,
      includePending: params.includePending,
      ...searchQuery,
    },
    claims.uid
  )) || [[], 0]

  const start =
    startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
  const hasNextPage = pages.length > first
  const endCursor = String(start + pages.length - (hasNextPage ? 1 : 0))

  console.log(
    'start',
    start,
    'returning end cursor',
    endCursor,
    'length',
    pages.length - 1
  )

  //TODO: refactor so that the lastCursor included
  if (hasNextPage) {
    // remove an extra if exists
    pages.pop()
  }

  const edges = pages.map((a) => {
    return {
      node: {
        ...a,
        image: a.image && createImageProxyUrl(a.image, 260, 260),
        isArchived: !!a.archivedAt,
      },
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
      totalCount,
    },
  }
})

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

export const setShareArticleResolver = authorized<
  SetShareArticleSuccessPartial,
  SetShareArticleError,
  MutationSetShareArticleArgs
>(
  async (
    _,
    { input: { articleID, share, sharedComment, sharedWithHighlights } },
    { models, authTrx, claims: { uid }, log }
  ) => {
    const article = await models.article.get(articleID)
    if (!article) {
      return { errorCodes: [SetShareArticleErrorCode.NotFound] }
    }

    const sharedAt = share ? new Date() : null

    log.info(`${share ? 'S' : 'Uns'}haring an article`, {
      article: Object.assign({}, article, {
        content: undefined,
        originalHtml: undefined,
        sharedAt,
      }),
      labels: {
        source: 'resolver',
        resolver: 'setShareArticleResolver',
        articleId: article.id,
        userId: uid,
      },
    })

    const result = await authTrx((tx) =>
      models.userArticle.updateByArticleId(
        uid,
        articleID,
        { sharedAt, sharedComment, sharedWithHighlights },
        tx
      )
    )

    if (!result) {
      return { errorCodes: [SetShareArticleErrorCode.NotFound] }
    }

    // Make sure article.id instead of userArticle.id has passed. We use it for cache updates
    const updatedArticle = {
      ...result,
      ...article,
      postedByViewer: !!sharedAt,
    }
    const updatedFeedArticle = sharedAt ? { ...result, sharedAt } : undefined
    return {
      updatedFeedArticleId: result.id,
      updatedFeedArticle,
      updatedArticle,
    }
  }
)

export type SetBookmarkArticleSuccessPartial = Merge<
  SetBookmarkArticleSuccess,
  { bookmarkedArticle: PartialArticle }
>
export const setBookmarkArticleResolver = authorized<
  SetBookmarkArticleSuccessPartial,
  SetBookmarkArticleError,
  MutationSetBookmarkArticleArgs
>(
  async (
    _,
    { input: { articleID, bookmark } },
    { claims: { uid }, log, pubsub }
  ) => {
    const page = await getPageById(articleID)
    if (!page) {
      return { errorCodes: [SetBookmarkArticleErrorCode.NotFound] }
    }

    if (!bookmark) {
      const pageRemoved = await getPageByParam({
        userId: uid,
        _id: articleID,
      })

      if (!pageRemoved) {
        return { errorCodes: [SetBookmarkArticleErrorCode.NotFound] }
      }

      // delete the page
      const deleted = await updatePage(
        pageRemoved.id,
        { state: ArticleSavingRequestStatus.Deleted },
        { pubsub, uid }
      )
      if (!deleted) {
        return { errorCodes: [SetBookmarkArticleErrorCode.NotFound] }
      }

      analytics.track({
        userId: uid,
        event: 'link_removed',
        properties: {
          url: pageRemoved.url,
          env: env.server.apiEnv,
        },
      })

      log.info('Article unbookmarked', {
        page: Object.assign({}, page, {
          content: undefined,
          originalHtml: undefined,
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
        bookmarkedArticle: {
          ...pageRemoved,
          isArchived: false,
          savedByViewer: false,
          postedByViewer: false,
        },
      }
    } else {
      try {
        const pageUpdated: Partial<Page> = {
          userId: uid,
          slug: generateSlug(page.title),
        }
        const updated = await updatePage(articleID, pageUpdated, {
          pubsub,
          uid,
        })
        if (!updated) {
          return { errorCodes: [SetBookmarkArticleErrorCode.NotFound] }
        }

        log.info('Article bookmarked', {
          page: Object.assign({}, page, {
            content: undefined,
            originalHtml: undefined,
          }),
          labels: {
            source: 'resolver',
            resolver: 'setBookmarkArticleResolver',
            userId: uid,
          },
        })

        // Make sure article.id instead of userArticle.id has passed. We use it for cache updates
        return {
          bookmarkedArticle: {
            ...pageUpdated,
            ...page,
            isArchived: false,
            savedByViewer: true,
            postedByViewer: false,
          },
        }
      } catch (error) {
        return { errorCodes: [SetBookmarkArticleErrorCode.BookmarkExists] }
      }
    }
  }
)

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
    { input: { id, readingProgressPercent, readingProgressAnchorIndex } },
    { claims: { uid }, pubsub }
  ) => {
    const page = await getPageByParam({ userId: uid, _id: id })

    if (!page) {
      return { errorCodes: [SaveArticleReadingProgressErrorCode.NotFound] }
    }

    if (
      (!readingProgressPercent && readingProgressPercent !== 0) ||
      readingProgressPercent < 0 ||
      readingProgressPercent > 100
    ) {
      return { errorCodes: [SaveArticleReadingProgressErrorCode.BadData] }
    }

    // If setting to zero we accept the update, otherwise we require it
    // be greater than the current reading progress.
    const shouldUpdate =
      readingProgressPercent === 0 ||
      page.readingProgressPercent < readingProgressPercent ||
      page.readingProgressAnchorIndex < readingProgressAnchorIndex

    const updatedPart = {
      readingProgressPercent: shouldUpdate
        ? readingProgressPercent
        : page.readingProgressPercent,
      readingProgressAnchorIndex: shouldUpdate
        ? readingProgressAnchorIndex
        : page.readingProgressAnchorIndex,
      readAt: new Date(),
    }

    await updatePage(id, updatedPart, { pubsub, uid })

    return {
      updatedArticle: {
        ...page,
        ...updatedPart,
        isArchived: !!page.archivedAt,
      },
    }
  }
)

export const getReadingProgressForArticleResolver: ResolverFn<
  number | { errorCodes: string[] },
  Article,
  WithDataSourcesContext,
  Record<string, unknown>
> = async (article, _params, { claims }) => {
  if (!claims?.uid) {
    return 0
  }

  if (
    article.readingProgressPercent !== undefined &&
    article.readingProgressPercent !== null
  ) {
    return article.readingProgressPercent
  }

  const articleReadingProgress = (
    await getPageByParam({ userId: claims.uid, _id: article.id })
  )?.readingProgressPercent

  return articleReadingProgress || 0
}

export const getReadingProgressAnchorIndexForArticleResolver: ResolverFn<
  number | { errorCodes: string[] },
  Article,
  WithDataSourcesContext,
  Record<string, unknown>
> = async (article, _params, { claims }) => {
  if (!claims?.uid) {
    return 0
  }

  if (
    article.readingProgressAnchorIndex !== undefined &&
    article.readingProgressAnchorIndex !== null
  ) {
    return article.readingProgressAnchorIndex
  }

  const articleReadingProgressAnchorIndex = (
    await getPageByParam({ userId: claims.uid, _id: article.id })
  )?.readingProgressAnchorIndex

  return articleReadingProgressAnchorIndex || 0
}

export const searchResolver = authorized<
  SearchSuccess,
  SearchError,
  QuerySearchArgs
>(async (_obj, params, { claims }) => {
  const startCursor = params.after || ''
  const first = params.first || 10

  const searchQuery = parseSearchQuery(params.query || undefined)

  analytics.track({
    userId: claims.uid,
    event: 'search',
    properties: {
      env: env.server.apiEnv,
      ...searchQuery,
    },
  })

  let results: SearchItemData[]
  let totalCount: number

  const searchType = searchQuery.typeFilter
  // search highlights if type:highlights
  if (searchType === PageType.Highlights) {
    ;[results, totalCount] = (await searchHighlights(
      {
        from: Number(startCursor),
        size: first + 1, // fetch one more item to get next cursor
        sort: searchQuery.sortParams,
        query: searchQuery.query,
      },
      claims.uid
    )) || [[], 0]
  } else {
    // otherwise, search pages
    ;[results, totalCount] = (await searchPages(
      {
        from: Number(startCursor),
        size: first + 1, // fetch one more item to get next cursor
        sort: searchQuery.sortParams,
        includePending: true,
        ...searchQuery,
      },
      claims.uid
    )) || [[], 0]
  }

  const start =
    startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
  const hasNextPage = results.length > first
  const endCursor = String(start + results.length - (hasNextPage ? 1 : 0))

  if (hasNextPage) {
    // remove an extra if exists
    results.pop()
  }

  const edges = results.map((r) => {
    return {
      node: {
        ...r,
        image: r.image && createImageProxyUrl(r.image, 260, 260),
        isArchived: !!r.archivedAt,
        contentReader:
          r.pageType === PageType.File ? ContentReader.Pdf : ContentReader.Web,
        originalArticleUrl: r.url,
        publishedAt: validatedDate(r.publishedAt),
        ownedByViewer: r.userId === claims.uid,
        pageType: r.pageType || PageType.Highlights,
        siteIcon: r.siteIcon && createImageProxyUrl(r.siteIcon, 32, 32),
      } as SearchItem,
      cursor: endCursor,
    }
  })

  // save query, including advanced search terms, in search history
  if (params.query) {
    await saveSearchHistory(claims.uid, params.query)
  }

  return {
    edges,
    pageInfo: {
      hasPreviousPage: false,
      startCursor,
      hasNextPage: hasNextPage,
      endCursor,
      totalCount,
    },
  }
})

export const typeaheadSearchResolver = authorized<
  TypeaheadSearchSuccess,
  TypeaheadSearchError,
  QueryTypeaheadSearchArgs
>(async (_obj, { query, first }, { claims }) => {
  if (!claims?.uid) {
    return { errorCodes: [TypeaheadSearchErrorCode.Unauthorized] }
  }

  analytics.track({
    userId: claims.uid,
    event: 'typeahead',
    properties: {
      env: env.server.apiEnv,
      query,
      first,
    },
  })

  return { items: await searchAsYouType(claims.uid, query, first || undefined) }
})

export const updatesSinceResolver = authorized<
  UpdatesSinceSuccess,
  UpdatesSinceError,
  QueryUpdatesSinceArgs
>(async (_obj, { since, first, after }, { claims: { uid } }) => {
  if (!uid) {
    return { errorCodes: [UpdatesSinceErrorCode.Unauthorized] }
  }

  analytics.track({
    userId: uid,
    event: 'updatesSince',
    properties: {
      env: env.server.apiEnv,
      since,
      first,
      after,
    },
  })

  const startCursor = after || ''
  const size = first || 10
  const startDate = new Date(since)
  const [pages, totalCount] = (await searchPages(
    {
      from: Number(startCursor),
      size: size + 1, // fetch one more item to get next cursor
      includeDeleted: true,
      dateFilters: [{ field: 'updatedAt', startDate }],
      sort: { by: SortBy.UPDATED, order: SortOrder.ASCENDING },
    },
    uid
  )) || [[], 0]

  const start =
    startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
  const hasNextPage = pages.length > size
  const endCursor = String(start + pages.length - (hasNextPage ? 1 : 0))

  //TODO: refactor so that the lastCursor included
  if (hasNextPage) {
    // remove an extra if exists
    pages.pop()
  }

  const edges = pages.map((p) => {
    const updateReason = getUpdateReason(p, startDate)
    return {
      node: {
        ...p,
        image: p.image && createImageProxyUrl(p.image, 260, 260),
        isArchived: !!p.archivedAt,
        contentReader:
          p.pageType === PageType.File ? ContentReader.Pdf : ContentReader.Web,
      } as SearchItem,
      cursor: endCursor,
      itemID: p.id,
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
      totalCount,
    },
  }
})

const getUpdateReason = (page: Page, since: Date) => {
  if (page.state === ArticleSavingRequestStatus.Deleted) {
    return UpdateReason.Deleted
  }
  if (page.createdAt >= since) {
    return UpdateReason.Created
  }
  return UpdateReason.Updated
}
