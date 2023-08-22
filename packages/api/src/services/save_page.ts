import { Readability } from '@omnivore/readability'
import { addHighlightToPage } from '../elastic/highlights'
import { createPage, getPageByParam, updatePage } from '../elastic/pages'
import { ArticleSavingRequestStatus, Page, PageType } from '../elastic/types'
import { User } from '../entity/user'
import { homePageURL } from '../env'
import {
  HighlightType,
  Maybe,
  PreparedDocumentInput,
  SaveErrorCode,
  SavePageInput,
  SaveResult,
} from '../generated/graphql'
import { WithDataSourcesContext } from '../resolvers/types'
import { enqueueThumbnailTask } from '../utils/createTask'
import {
  cleanUrl,
  generateSlug,
  stringToHash,
  TWEET_URL_REGEX,
  validatedDate,
  wordsCount,
} from '../utils/helpers'
import { logger } from '../utils/logger'
import { parsePreparedContent } from '../utils/parser'
import { createPageSaveRequest } from './create_page_save_request'
import { createLabels } from './labels'

// where we can use APIs to fetch their underlying content.
const FORCE_PUPPETEER_URLS = [
  TWEET_URL_REGEX,
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/,
]

const createSlug = (url: string, title?: Maybe<string> | undefined) => {
  const { pathname } = new URL(url)
  const croppedPathname = decodeURIComponent(
    pathname
      .split('/')
      [pathname.split('/').length - 1].split('.')
      .slice(0, -1)
      .join('.')
  ).replace(/_/gi, ' ')

  return [generateSlug(title || croppedPathname), croppedPathname]
}

const shouldParseInBackend = (input: SavePageInput): boolean => {
  return (
    input.source !== 'puppeteer-parse' &&
    FORCE_PUPPETEER_URLS.some((regex) => regex.test(input.url))
  )
}

export const savePage = async (
  ctx: WithDataSourcesContext,
  user: User,
  input: SavePageInput
): Promise<SaveResult> => {
  const parseResult = await parsePreparedContent(
    input.url,
    {
      document: input.originalContent,
      pageInfo: {
        title: input.title,
        canonicalUrl: input.url,
      },
    },
    input.parseResult
  )
  const [newSlug, croppedPathname] = createSlug(input.url, input.title)
  let slug = newSlug
  let pageId = input.clientRequestId
  const articleToSave = parsedContentToPage({
    url: input.url,
    title: input.title,
    userId: user.id,
    pageId,
    slug,
    croppedPathname,
    parsedContent: parseResult.parsedContent,
    pageType: parseResult.pageType,
    originalHtml: parseResult.domContent,
    canonicalUrl: parseResult.canonicalUrl,
    rssFeedUrl: input.rssFeedUrl,
    saveTime: input.savedAt ? new Date(input.savedAt) : undefined,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
  })

  // save state
  articleToSave.archivedAt =
    input.state === ArticleSavingRequestStatus.Archived ? new Date() : null
  // add labels to page
  articleToSave.labels = input.labels
    ? await createLabels(ctx, input.labels)
    : undefined

  const isImported = input.source === 'csv-importer'

  // always parse in backend if the url is in the force puppeteer list
  if (shouldParseInBackend(input)) {
    try {
      await createPageSaveRequest({
        userId: user.id,
        url: articleToSave.url,
        pubsub: ctx.pubsub,
        articleSavingRequestId: input.clientRequestId,
        archivedAt: articleToSave.archivedAt,
        labels: articleToSave.labels,
      })
    } catch (e) {
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to create page save request',
      }
    }
  } else {
    // check if the page already exists
    const existingPage = await getPageByParam({
      userId: user.id,
      url: articleToSave.url,
    })
    if (existingPage) {
      // we don't want to update an rss feed page if rss-feeder is tring to re-save it
      if (
        existingPage.rssFeedUrl &&
        existingPage.rssFeedUrl === input.rssFeedUrl
      ) {
        return {
          clientRequestId: pageId,
          url: `${homePageURL()}/${user.profile.username}/${slug}`,
        }
      }

      pageId = existingPage.id
      slug = existingPage.slug
      if (
        !(await updatePage(
          existingPage.id,
          {
            // update the page with the new content
            ...articleToSave,
            id: pageId, // we don't want to update the id
            slug, // we don't want to update the slug
            createdAt: existingPage.createdAt, // we don't want to update the createdAt
          },
          ctx
        ))
      ) {
        return {
          errorCodes: [SaveErrorCode.Unknown],
          message: 'Failed to update existing page',
        }
      }
    } else {
      // do not publish a pubsub event if the page is imported
      const newPageId = await createPage(articleToSave, {
        ...ctx,
        shouldPublish: !isImported,
      })
      if (!newPageId) {
        return {
          errorCodes: [SaveErrorCode.Unknown],
          message: 'Failed to create new page',
        }
      }
      pageId = newPageId
    }
  }

  // we don't want to create thumbnail for imported pages
  if (!isImported) {
    try {
      // create a task to update thumbnail and pre-cache all images
      const taskId = await enqueueThumbnailTask(user.id, slug)
      logger.info('Created thumbnail task', { taskId })
    } catch (e) {
      logger.error('Failed to create thumbnail task', e)
    }
  }

  if (parseResult.highlightData) {
    const highlight = {
      updatedAt: new Date(),
      createdAt: new Date(),
      userId: ctx.uid,
      elasticPageId: pageId,
      ...parseResult.highlightData,
      type: HighlightType.Highlight,
    }

    if (!(await addHighlightToPage(pageId, highlight, ctx))) {
      return {
        errorCodes: [SaveErrorCode.EmbeddedHighlightFailed],
        message: 'Failed to save highlight',
      }
    }
  }

  return {
    clientRequestId: pageId,
    url: `${homePageURL()}/${user.profile.username}/${slug}`,
  }
}

// convert parsed content to an elastic page
export const parsedContentToPage = ({
  url,
  userId,
  originalHtml,
  pageId,
  parsedContent,
  slug,
  croppedPathname,
  title,
  preparedDocument,
  canonicalUrl,
  pageType,
  uploadFileHash,
  uploadFileId,
  saveTime,
  rssFeedUrl,
  publishedAt,
}: {
  url: string
  userId: string
  slug: string
  croppedPathname: string
  pageType: PageType
  parsedContent: Readability.ParseResult | null
  originalHtml?: string | null
  pageId?: string | null
  title?: string | null
  preparedDocument?: PreparedDocumentInput | null
  canonicalUrl?: string | null
  uploadFileHash?: string | null
  uploadFileId?: string | null
  saveTime?: Date
  rssFeedUrl?: string | null
  publishedAt?: Date | null
}): Page => {
  return {
    id: pageId || '',
    slug,
    userId,
    originalHtml,
    content: parsedContent?.content || '',
    description: parsedContent?.excerpt,
    title:
      title ||
      parsedContent?.title ||
      preparedDocument?.pageInfo.title ||
      croppedPathname ||
      parsedContent?.siteName ||
      url,
    author: parsedContent?.byline ?? undefined,
    url: cleanUrl(canonicalUrl || url),
    pageType,
    hash: uploadFileHash || stringToHash(parsedContent?.content || url),
    image: parsedContent?.previewImage ?? undefined,
    publishedAt: validatedDate(
      publishedAt || parsedContent?.publishedDate || undefined
    ),
    uploadFileId,
    readingProgressPercent: 0,
    readingProgressAnchorIndex: 0,
    state: ArticleSavingRequestStatus.Succeeded,
    createdAt: validatedDate(saveTime) || new Date(),
    savedAt: validatedDate(saveTime) || new Date(),
    siteName: parsedContent?.siteName ?? undefined,
    language: parsedContent?.language ?? undefined,
    siteIcon: parsedContent?.siteIcon ?? undefined,
    wordsCount: wordsCount(parsedContent?.textContent || ''),
    rssFeedUrl: rssFeedUrl || undefined,
  }
}
