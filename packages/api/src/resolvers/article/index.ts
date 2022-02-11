/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  FeedArticle,
  PageInfo,
  Article,
  ArticleError,
  ArticleErrorCode,
  ArticlesError,
  ArticleSuccess,
  CreateArticleError,
  CreateArticleErrorCode,
  CreateArticleSuccess,
  MutationCreateArticleArgs,
  MutationSaveArticleReadingProgressArgs,
  MutationSetBookmarkArticleArgs,
  MutationSetShareArticleArgs,
  QueryArticleArgs,
  SaveArticleReadingProgressError,
  SaveArticleReadingProgressErrorCode,
  SaveArticleReadingProgressSuccess,
  SetBookmarkArticleError,
  SetBookmarkArticleErrorCode,
  SetBookmarkArticleSuccess,
  SetShareArticleError,
  SetShareArticleErrorCode,
  SetShareArticleSuccess,
  ResolverFn,
  PageType,
  ContentReader,
} from '../../generated/graphql'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Merge } from '../../util'
import {
  makeStorageFilePublic,
  getStorageFileDetails,
} from '../../utils/uploads'
import { ContentParseError } from '../../utils/errors'
import {
  articleSavingRequestError,
  articleSavingRequestPopulate,
  authorized,
  generateSlug,
  stringToHash,
  userDataToUser,
  validatedDate,
} from '../../utils/helpers'
import {
  parseOriginalContent,
  parsePreparedContent,
  ParsedContentPuppeteer,
} from '../../utils/parser'
import { isSiteBlockedForParse } from '../../utils/blocked'
import { Readability } from '@omnivore/readability'
import { traceAs } from '../../tracing'

import { createImageProxyUrl } from '../../utils/imageproxy'
import normalizeUrl from 'normalize-url'
import { WithDataSourcesContext } from '../types'
import { UserArticleData } from '../../datalayer/links/model'

import { parseSearchQuery } from '../../utils/search'
import { createPageSaveRequest } from '../../services/create_page_save_request'
import { createIntercomEvent } from '../../utils/intercom'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'

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
    createIntercomEvent('link-saved', uid)

    const articleSavingRequest = articleSavingRequestId
      ? (await models.articleSavingRequest.get(articleSavingRequestId)) ||
        (await authTrx((tx) =>
          models.articleSavingRequest.create(
            { userId: uid, id: articleSavingRequestId },
            tx
          )
        ))
      : undefined

    const user = userDataToUser(await models.user.get(uid))
    try {
      if (isSiteBlockedForParse(url)) {
        return articleSavingRequestError(
          {
            errorCodes: [CreateArticleErrorCode.NotAllowedToParse],
          },
          ctx,
          articleSavingRequest
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
          return articleSavingRequestError(
            { errorCodes: [CreateArticleErrorCode.UploadFileMissing] },
            ctx,
            articleSavingRequest
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
            return await parsePreparedContent(url, preparedDocument)
          }
        )
        parsedContent = parseResults.parsedContent
        canonicalUrl = parseResults.canonicalUrl
        domContent = parseResults.domContent

        pageType = parseOriginalContent(url, domContent)
      } else if (!preparedDocument?.document) {
        // We have a URL but no document, so we try to send this to puppeteer
        // and return a dummy response.
        await createPageSaveRequest(uid, url, models)
        return DUMMY_RESPONSE
      }

      const saveTime = new Date()
      const slug = generateSlug(parsedContent?.title || croppedPathname)
      const articleToSave = {
        originalHtml: domContent,
        content: parsedContent?.content || '',
        description: parsedContent?.excerpt,
        title:
          parsedContent?.title ||
          preparedDocument?.pageInfo.title ||
          croppedPathname,
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
      }

      if (canonicalUrl && domContent) {
        await ctx.pubsub.pageSaved(uid, canonicalUrl, domContent)
      }

      let archive = false
      if (articleSavingRequestId) {
        const reminder = await models.reminder.getByRequestId(
          uid,
          articleSavingRequestId
        )
        if (reminder) {
          archive = reminder.archiveUntil || false
        }
      }

      const existingArticle = await models.article.getByUrlAndHash({
        url: articleToSave.url,
        hash: articleToSave.hash,
      })

      if (existingArticle) {
        let uploadFileUrlOverride = ''
        if (existingArticle.uploadFileId) {
          /* Grab the public URL from the existing uploaded Article, we ignore
           * the duplicate uploaded file record, leave it in initialized/unused
           * state (the duplicate uploaded file in GCS will remain private).
           */
          const uploadFileData = await models.uploadFile.get(
            existingArticle.uploadFileId
          )
          uploadFileUrlOverride = await makeStorageFilePublic(
            uploadFileData.id,
            uploadFileData.fileName
          )
        }

        // Checking if either a user article pointing to existing article or with the same URL exists
        const matchedUserArticleRecord =
          (await models.userArticle.getByParameters(uid, {
            articleId: existingArticle.id,
          })) ||
          (await models.userArticle.getByParameters(uid, {
            articleUrl: articleToSave.url,
          }))

        if (matchedUserArticleRecord) {
          log.info('Article exists, updating user article', {
            existingArticleId: existingArticle.id,
            matchedUserArticleRecord,
            uploadFileId: existingArticle.uploadFileId,
            uploadFileUrlOverride,
            labels: {
              source: 'resolver',
              resolver: 'createArticleResolver',
              articleId: existingArticle.id,
              userId: uid,
            },
          })

          // If the user already has the article saved, we just update savedAt
          // and we unarchive the article by updating archivedAt, unless they have
          // a reminder set to archive the article.
          const updatedArticle = await authTrx((tx) =>
            models.userArticle.update(
              matchedUserArticleRecord.id,
              {
                slug: slug,
                archivedAt: archive ? saveTime : null,
                savedAt: saveTime,
                articleId: existingArticle.id,
                articleUrl: uploadFileUrlOverride || existingArticle.url,
                articleHash: existingArticle.hash,
              },
              tx
            )
          )

          const createdArticle = { ...existingArticle, ...updatedArticle }
          return articleSavingRequestPopulate(
            {
              user,
              created: false,
              createdArticle: createdArticle,
            },
            ctx,
            articleSavingRequest?.id,
            createdArticle.articleId || undefined
          )
        } else {
          log.info('Article exists, creating user article', {
            existingArticleId: existingArticle.id,
            uploadFileId: existingArticle.uploadFileId,
            uploadFileUrlOverride,
            labels: {
              source: 'resolver',
              resolver: 'createArticleResolver',
              articleId: existingArticle.id,
              userId: uid,
            },
          })

          const updatedArticle = await models.userArticle.create({
            slug: slug,
            userId: uid,
            articleId: existingArticle.id,
            articleUrl: uploadFileUrlOverride || existingArticle.url,
            articleHash: existingArticle.hash,
          })

          const createdArticle = { ...existingArticle, ...updatedArticle }
          return articleSavingRequestPopulate(
            {
              user,
              created: false,
              createdArticle: createdArticle,
            },
            ctx,
            articleSavingRequest?.id,
            createdArticle.articleId || undefined
          )
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
          return await models.uploadFile.setFileUploadComplete(uploadFileId, tx)
        })
        if (!uploadFileData || !uploadFileData.id || !uploadFileData.fileName) {
          return articleSavingRequestError(
            {
              errorCodes: [CreateArticleErrorCode.UploadFileMissing],
            },
            ctx,
            articleSavingRequest
          )
        }
        uploadFileUrlOverride = await makeStorageFilePublic(
          uploadFileData.id,
          uploadFileData.fileName
        )
      }

      const [articleRecord, matchedUserArticleRecord] = await Promise.all([
        models.article.create(articleToSave),
        models.userArticle.getByParameters(uid, {
          articleUrl: articleToSave.url,
        }),
      ])

      if (!matchedUserArticleRecord && canonicalUrl && domContent) {
        await ctx.pubsub.pageCreated(uid, canonicalUrl, domContent)
      }

      // Updating already existing user_article record with the new saved_at date and the new article record
      // or creating the new one.
      const userArticle = await authTrx<Promise<UserArticleData>>((tx) =>
        matchedUserArticleRecord
          ? models.userArticle.update(
              matchedUserArticleRecord.id,
              {
                slug: slug,
                savedAt: saveTime,
                articleId: articleRecord.id,
                archivedAt: archive ? saveTime : null,
                articleUrl: uploadFileUrlOverride || articleRecord.url,
                articleHash: articleRecord.hash,
              },
              tx
            )
          : models.userArticle.create(
              {
                userId: uid,
                slug: slug,
                savedAt: saveTime,
                articleId: articleRecord.id,
                archivedAt: archive ? saveTime : null,
                articleUrl: uploadFileUrlOverride || articleRecord.url,
                articleHash: articleRecord.hash,
              },
              tx
            )
      )

      const createdArticle = { ...userArticle, ...articleRecord }
      return articleSavingRequestPopulate(
        {
          user,
          created: false,
          createdArticle: createdArticle,
        },
        ctx,
        articleSavingRequest?.id,
        createdArticle.articleId || undefined
      )
    } catch (error) {
      if (
        error instanceof ContentParseError &&
        error.message === 'UNABLE_TO_PARSE'
      ) {
        return articleSavingRequestError(
          { errorCodes: [CreateArticleErrorCode.UnableToParse] },
          ctx,
          articleSavingRequest
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
> = async (_obj, { username, slug }, { claims, models }) => {
  try {
    if (!claims?.uid) {
      return { errorCodes: [ArticleErrorCode.Unauthorized] }
    }

    analytics.track({
      userId: claims?.uid,
      event: 'link_fetched',
      properties: {
        slug,
        env: env.server.apiEnv,
      },
    })
    createIntercomEvent('get-article', claims.uid)

    const article = await models.userArticle.getByUserIdAndSlug(
      claims.uid,
      slug
    )

    if (!article) {
      return { errorCodes: [ArticleErrorCode.NotFound] }
    }

    return { article: article }
  } catch (error) {
    return { errorCodes: [ArticleErrorCode.BadData] }
  }
}

type PaginatedPartialArticles = {
  edges: { cursor: string; node: PartialArticle }[]
  pageInfo: PageInfo
}

export const getArticlesResolver = authorized<
  PaginatedPartialArticles,
  ArticlesError
>(async (_obj, _params, { models, claims, authTrx }) => {
  const notNullField = _params?.sharedOnly ? 'sharedAt' : null
  const startCursor = _params.after || ''
  const first = _params.first || 10

  // Perform basic sanitization. Right now we just allow alphanumeric, space and quote
  // so queries can contain phrases like "human race". In the future we will need to
  // split out terms like "label:unread".
  const searchQuery = parseSearchQuery(_params.query)

  analytics.track({
    userId: claims.uid,
    event: 'search',
    properties: {
      query: searchQuery.query,
      inFilter: searchQuery.inFilter,
      readFilter: searchQuery.readFilter,
      typeFilter: searchQuery.typeFilter,
      env: env.server.apiEnv,
    },
  })
  createIntercomEvent('search', claims.uid)

  const [userArticles, totalCount] = (await authTrx((tx) =>
    models.userArticle.getPaginated(
      {
        cursor: startCursor,
        first: first + 1, // fetch one more item to get next cursor
        sort: _params.sort,
        query: searchQuery.query,
        inFilter: searchQuery.inFilter,
        readFilter: searchQuery.readFilter,
        typeFilter: searchQuery.typeFilter,
      },
      claims.uid,
      tx,
      notNullField
    )
  )) || [[], 0]

  const start =
    startCursor && !isNaN(Number(startCursor)) ? Number(startCursor) : 0
  const hasNextPage = userArticles.length > first
  const endCursor = String(start + userArticles.length - (hasNextPage ? 1 : 0))

  console.log(
    'start',
    start,
    'returning end cursor',
    endCursor,
    'length',
    userArticles.length - 1
  )

  //TODO: refactor so that the lastCursor included
  if (hasNextPage) {
    // remove an extra if exists
    userArticles.pop()
  }

  const edges = userArticles.map((a) => {
    return {
      node: { ...a, image: a.image && createImageProxyUrl(a.image, 88, 88) },
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
    { models, authTrx, claims: { uid }, log }
  ) => {
    const article = await models.article.get(articleID)
    if (!article) {
      return { errorCodes: [SetBookmarkArticleErrorCode.NotFound] }
    }

    if (!bookmark) {
      const { userArticleRemoved, highlightsUnshared } = await authTrx(
        async (tx) => {
          const userArticleRemoved = await models.userArticle.getForUser(
            uid,
            article.id,
            tx
          )

          await models.userArticle.deleteWhere(
            { userId: uid, articleId: article.id },
            tx
          )

          const highlightsUnshared =
            await models.highlight.unshareAllHighlights(articleID, uid, tx)

          return { userArticleRemoved, highlightsUnshared }
        }
      )

      if (!userArticleRemoved) {
        return { errorCodes: [SetBookmarkArticleErrorCode.NotFound] }
      }

      log.info('Article unbookmarked', {
        article: Object.assign({}, article, {
          content: undefined,
          originalHtml: undefined,
        }),
        highlightsUnshared: highlightsUnshared.length,
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
          ...userArticleRemoved,
          ...article,
          savedByViewer: false,
          postedByViewer: false,
        },
      }
    } else {
      try {
        const userArticle = await authTrx((tx) => {
          return models.userArticle.create(
            {
              userId: uid,
              articleId: article.id,
              slug: generateSlug(article.title),
              articleUrl: article.url,
              articleHash: article.hash,
            },
            tx
          )
        })
        log.info('Article bookmarked', {
          article: Object.assign({}, article, {
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
            ...userArticle,
            ...article,
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
    { models, authTrx, claims: { uid } }
  ) => {
    const userArticleRecord = await authTrx((tx) =>
      models.userArticle.getByParameters(uid, { articleId: id }, tx)
    )

    if (!userArticleRecord) {
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
      userArticleRecord.articleReadingProgress < readingProgressPercent ||
      userArticleRecord.articleReadingProgressAnchorIndex <
        readingProgressAnchorIndex

    const updatedArticle = Object.assign(await models.article.get(id), {
      readingProgressPercent: shouldUpdate
        ? readingProgressPercent
        : userArticleRecord.articleReadingProgress,
      readingProgressAnchorIndex: shouldUpdate
        ? readingProgressAnchorIndex
        : userArticleRecord.articleReadingProgressAnchorIndex,
    })

    shouldUpdate &&
      (await authTrx((tx) =>
        models.userArticle.update(
          userArticleRecord.id,
          {
            articleReadingProgress: readingProgressPercent,
            articleReadingProgressAnchorIndex: readingProgressAnchorIndex,
          },
          tx
        )
      ))

    return { updatedArticle: { ...userArticleRecord, ...updatedArticle } }
  }
)

export const getReadingProgressForArticleResolver: ResolverFn<
  number | { errorCodes: string[] },
  Article,
  WithDataSourcesContext,
  Record<string, unknown>
> = async (article, _params, { models, claims }) => {
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
    await models.userArticle.getByArticleId(claims.uid, article.id)
  )?.articleReadingProgress

  return articleReadingProgress || 0
}

export const getReadingProgressAnchorIndexForArticleResolver: ResolverFn<
  number | { errorCodes: string[] },
  Article,
  WithDataSourcesContext,
  Record<string, unknown>
> = async (article, _params, { models, claims }) => {
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
    await models.userArticle.getByArticleId(claims.uid, article.id)
  )?.articleReadingProgressAnchorIndex

  return articleReadingProgressAnchorIndex || 0
}
