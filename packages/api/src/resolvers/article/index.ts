/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Readability } from '@omnivore/readability'
import graphqlFields from 'graphql-fields'
import normalizeUrl from 'normalize-url'
import { searchHighlights } from '../../elastic/highlights'
import {
  createPage,
  getPageByParam,
  searchAsYouType,
  searchPages,
  updatePage,
  updatePages,
} from '../../elastic/pages'
import {
  ArticleSavingRequestStatus,
  Page,
  PageType,
  SearchItem as SearchItemData,
} from '../../elastic/types'
import { env } from '../../env'
import {
  Article,
  ArticleError,
  ArticleErrorCode,
  ArticlesError,
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
  InputMaybe,
  MutationBulkActionArgs,
  MutationCreateArticleArgs,
  MutationSaveArticleReadingProgressArgs,
  MutationSetBookmarkArticleArgs,
  MutationSetFavoriteArticleArgs,
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
  SearchErrorCode,
  SearchItem,
  SearchSuccess,
  SetBookmarkArticleError,
  SetBookmarkArticleErrorCode,
  SetBookmarkArticleSuccess,
  SetFavoriteArticleError,
  SetFavoriteArticleErrorCode,
  SetFavoriteArticleSuccess,
  SetShareArticleError,
  SetShareArticleErrorCode,
  SetShareArticleSuccess,
  SortParams,
  TypeaheadSearchError,
  TypeaheadSearchErrorCode,
  TypeaheadSearchItem,
  TypeaheadSearchSuccess,
  UpdateReason,
  UpdatesSinceError,
  UpdatesSinceErrorCode,
  UpdatesSinceSuccess,
} from '../../generated/graphql'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import {
  addLabelToPage,
  createLabels,
  getLabelsByIds,
} from '../../services/labels'
import { parsedContentToPage } from '../../services/save_page'
import { traceAs } from '../../tracing'
import { Merge } from '../../util'
import { analytics } from '../../utils/analytics'
import { isSiteBlockedForParse } from '../../utils/blocked'
import { ContentParseError } from '../../utils/errors'
import {
  authorized,
  generateSlug,
  isBase64Image,
  isParsingTimeout,
  pageError,
  titleForFilePath,
  userDataToUser,
  validatedDate,
} from '../../utils/helpers'
import { createImageProxyUrl } from '../../utils/imageproxy'
import {
  contentConverter,
  getDistillerResult,
  htmlToMarkdown,
  ParsedContentPuppeteer,
  parsePreparedContent,
} from '../../utils/parser'
import { parseSearchQuery, SortBy, SortOrder } from '../../utils/search'
import {
  contentReaderForPage,
  getStorageFileDetails,
  makeStorageFilePublic,
} from '../../utils/uploads'
import { WithDataSourcesContext } from '../types'
import { pageTypeForContentType } from '../upload_files'

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
        articleSavingRequestId: pageId,
        uploadFileId,
        skipParsing,
        source,
        state,
        labels: inputLabels,
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
      // save state
      let archivedAt =
        state === ArticleSavingRequestStatus.Archived ? new Date() : null
      if (pageId) {
        const reminder = await models.reminder.getByRequestId(uid, pageId)
        if (reminder && reminder.archiveUntil) {
          archivedAt = new Date()
        }
      }
      // add labels to page
      const labels = inputLabels
        ? await createLabels(ctx, inputLabels)
        : undefined

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
        pageType = pageTypeForContentType(uploadFile.contentType)
        title = titleForFilePath(uploadFile.url)
      } else if (
        source !== 'puppeteer-parse' &&
        FORCE_PUPPETEER_URLS.some((regex) => regex.test(url))
      ) {
        await createPageSaveRequest({ userId: uid, url, archivedAt, labels })
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
        await createPageSaveRequest({ userId: uid, url, archivedAt, labels })
        return DUMMY_RESPONSE
      }

      const saveTime = new Date()
      const slug = generateSlug(parsedContent?.title || croppedPathname)
      const articleToSave = parsedContentToPage({
        url,
        title,
        parsedContent,
        userId: uid,
        pageId,
        slug,
        croppedPathname,
        originalHtml: domContent,
        pageType,
        preparedDocument,
        uploadFileHash,
        canonicalUrl,
        uploadFileId,
        saveTime,
      })

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
        await makeStorageFilePublic(uploadFileData.id, uploadFileData.fileName)
      }
      // save page's state and labels
      articleToSave.archivedAt = archivedAt
      articleToSave.labels = labels
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
> = async (_obj, { slug, format }, { claims }, info) => {
  try {
    if (!claims?.uid) {
      return { errorCodes: [ArticleErrorCode.Unauthorized] }
    }

    const includeOriginalHtml =
      format === ArticleFormat.Distiller ||
      !!graphqlFields(info).article.originalHtml

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
        {
          userId: claims.uid,
          slug,
        },
        includeOriginalHtml
      )) ||
      (await getPageByParam(
        {
          userId: claims.uid,
          _id: slug,
        },
        includeOriginalHtml
      ))

    if (!page || page.state === ArticleSavingRequestStatus.Deleted) {
      return { errorCodes: [ArticleErrorCode.NotFound] }
    }

    if (isParsingTimeout(page)) {
      page.content = UNPARSEABLE_CONTENT
    }

    if (format === ArticleFormat.Markdown) {
      page.content = htmlToMarkdown(page.content)
    } else if (format === ArticleFormat.Distiller) {
      if (!page.originalHtml) {
        return { errorCodes: [ArticleErrorCode.BadData] }
      }
      const distillerResult = await getDistillerResult(
        claims.uid,
        page.originalHtml
      )
      if (!distillerResult) {
        return { errorCodes: [ArticleErrorCode.BadData] }
      }
      page.content = distillerResult
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
    const page = await getPageByParam({
      userId: uid,
      _id: articleID,
    })
    if (!page) {
      return { errorCodes: [SetBookmarkArticleErrorCode.NotFound] }
    }

    if (!bookmark) {
      // delete the page and its metadata
      const deleted = await updatePage(
        page.id,
        {
          state: ArticleSavingRequestStatus.Deleted,
          labels: [],
          highlights: [],
          readingProgressAnchorIndex: 0,
          readingProgressPercent: 0,
        },
        { pubsub, uid }
      )
      if (!deleted) {
        return { errorCodes: [SetBookmarkArticleErrorCode.NotFound] }
      }

      analytics.track({
        userId: uid,
        event: 'link_removed',
        properties: {
          url: page.url,
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
          ...page,
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
    {
      input: {
        id,
        readingProgressPercent,
        readingProgressAnchorIndex,
        readingProgressTopPercent,
      },
    },
    { claims: { uid }, pubsub }
  ) => {
    const page = await getPageByParam({ userId: uid, _id: id })

    if (!page) {
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
      ? Math.max(readingProgressTopPercent, page.readingProgressTopPercent || 0)
      : readingProgressTopPercent === 0
      ? 0
      : undefined
    // If setting to zero we accept the update, otherwise we require it
    // be greater than the current reading progress.
    const updatedPart = {
      readingProgressPercent:
        readingProgressPercent === 0
          ? 0
          : Math.max(readingProgressPercent, page.readingProgressPercent),
      readingProgressAnchorIndex:
        readingProgressAnchorIndex === 0
          ? 0
          : Math.max(
              readingProgressAnchorIndex,
              page.readingProgressAnchorIndex
            ),
      readingProgressTopPercent: readingProgressTopPercentToSave,
      readAt: new Date(),
    }
    const updated = await updatePage(id, updatedPart, { pubsub, uid })
    if (!updated) {
      return { errorCodes: [SaveArticleReadingProgressErrorCode.NotFound] }
    }

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

  // the query size is limited to 255 characters
  if (params.query && params.query.length > 255) {
    return { errorCodes: [SearchErrorCode.QueryTooLong] }
  }

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
        includeContent: params.includeContent ?? false,
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
    let siteIcon = r.siteIcon
    if (siteIcon && !isBase64Image(siteIcon)) {
      siteIcon = createImageProxyUrl(siteIcon, 128, 128)
    }
    if (params.includeContent && r.content) {
      // convert html to the requested format
      const format = params.format || ArticleFormat.Html
      try {
        const converter = contentConverter(format)
        if (converter) {
          r.content = converter(r.content, r.highlights)
        }
      } catch (error) {
        console.log('Error converting content', error)
      }
    }

    return {
      node: {
        ...r,
        image: r.image && createImageProxyUrl(r.image, 260, 260),
        isArchived: !!r.archivedAt,
        contentReader: contentReaderForPage(r.pageType, r.uploadFileId),
        originalArticleUrl: r.url,
        publishedAt: validatedDate(r.publishedAt),
        ownedByViewer: r.userId === claims.uid,
        siteIcon,
      } as SearchItem,
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

  const results = await searchAsYouType(claims.uid, query, first || undefined)
  const items: TypeaheadSearchItem[] = results.map((r) => ({
    ...r,
    contentReader: contentReaderForPage(r.pageType, r.uploadFileId),
  }))

  return { items }
})

export const updatesSinceResolver = authorized<
  UpdatesSinceSuccess,
  UpdatesSinceError,
  QueryUpdatesSinceArgs
>(
  async (
    _obj,
    { since, first, after, sort: sortParams },
    { claims: { uid } }
  ) => {
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

    const sort = sortParamsToElasticSort(sortParams)

    const startCursor = after || ''
    const size = first || 10
    const startDate = new Date(since)
    const [pages, totalCount] = (await searchPages(
      {
        from: Number(startCursor),
        size: size + 1, // fetch one more item to get next cursor
        includeDeleted: true,
        dateFilters: [{ field: 'updatedAt', startDate }],
        sort,
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
          contentReader: contentReaderForPage(p.pageType, p.uploadFileId),
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
  }
)

export const bulkActionResolver = authorized<
  BulkActionSuccess,
  BulkActionError,
  MutationBulkActionArgs
>(
  async (
    _parent,
    { query, action, labelIds, expectedCount, async },
    { claims: { uid }, log }
  ) => {
    log.info('bulkActionResolver')

    analytics.track({
      userId: uid,
      event: 'BulkAction',
      properties: {
        env: env.server.apiEnv,
        action,
      },
    })

    if (!uid) {
      log.log('bulkActionResolver', { error: 'Unauthorized' })
      return { errorCodes: [BulkActionErrorCode.Unauthorized] }
    }

    if (!query) {
      log.log('bulkActionResolver', { error: 'no query' })
      return { errorCodes: [BulkActionErrorCode.BadRequest] }
    }

    // get labels if needed
    let labels = undefined
    if (action === BulkActionType.AddLabels) {
      if (!labelIds || labelIds.length === 0) {
        return { errorCodes: [BulkActionErrorCode.BadRequest] }
      }

      labels = await getLabelsByIds(uid, labelIds)
    }

    // parse query
    const searchQuery = parseSearchQuery(query)

    // start a task to update pages
    const taskId = await updatePages(
      uid,
      action,
      searchQuery,
      Math.min(expectedCount ?? 500, 500), // default and max to 500
      !!async, // default to false
      labels
    )

    return { success: !!taskId }
  }
)

export const setFavoriteArticleResolver = authorized<
  SetFavoriteArticleSuccess,
  SetFavoriteArticleError,
  MutationSetFavoriteArticleArgs
>(async (_, { id }, { claims: { uid }, log, pubsub }) => {
  try {
    const page = await getPageByParam({ userId: uid, _id: id })

    if (!page) {
      return { errorCodes: [SetFavoriteArticleErrorCode.NotFound] }
    }

    // adds Favorites label to page
    const result = await addLabelToPage(
      {
        uid,
        pubsub,
      },
      page.id,
      {
        name: 'Favorites',
        color: '#07D2D0', // TODO: pick a color
      }
    )
    if (!result) {
      return { errorCodes: [SetFavoriteArticleErrorCode.Unauthorized] }
    }

    log.debug('Favorites label added:', result)

    return {
      favoriteArticle: page,
    }
  } catch (error) {
    log.debug('Error adding Favorites label:', error)
    return { errorCodes: [SetFavoriteArticleErrorCode.BadRequest] }
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

const sortParamsToElasticSort = (
  sortParams: InputMaybe<SortParams> | undefined
) => {
  const sort = { by: SortBy.UPDATED, order: SortOrder.DESCENDING }

  if (sortParams) {
    sortParams.order === 'ASCENDING' && (sort.order = SortOrder.ASCENDING)
    switch (sortParams.by) {
      case 'UPDATED_TIME':
        sort.by = SortBy.UPDATED
        break
      case 'SCORE':
        sort.by = SortBy.SCORE
        break
      case 'PUBLISHED_AT':
        sort.by = SortBy.PUBLISHED
        break
      case 'SAVED_AT':
        sort.by = SortBy.SAVED
        break
    }
  }

  return sort
}
