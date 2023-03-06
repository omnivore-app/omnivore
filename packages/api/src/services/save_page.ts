import { Readability } from '@omnivore/readability'
import normalizeUrl from 'normalize-url'
import { PubsubClient } from '../datalayer/pubsub'
import { addHighlightToPage } from '../elastic/highlights'
import { createPage, getPageByParam, updatePage } from '../elastic/pages'
import { ArticleSavingRequestStatus, Page, PageType } from '../elastic/types'
import { homePageURL } from '../env'
import {
  HighlightType,
  Maybe,
  PreparedDocumentInput,
  SaveErrorCode,
  SavePageInput,
  SaveResult,
} from '../generated/graphql'
import { DataModels } from '../resolvers/types'
import {
  generateSlug,
  stringToHash,
  validatedDate,
  wordsCount,
} from '../utils/helpers'
import { parsePreparedContent } from '../utils/parser'
import { createPageSaveRequest } from './create_page_save_request'
import { createLabels } from './labels'

type SaveContext = {
  pubsub: PubsubClient
  models: DataModels
  uid: string
}

type SaverUserData = {
  userId: string
  username: string
}

// where we can use APIs to fetch their underlying content.
const FORCE_PUPPETEER_URLS = [
  // twitter status url regex
  /twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?/,
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

export const createSavingRequest = (
  ctx: SaveContext,
  clientRequestId: string
) => {
  return ctx.models.articleSavingRequest.create({
    userId: ctx.uid,
    id: clientRequestId,
  })
}

export const savePage = async (
  ctx: SaveContext,
  saver: SaverUserData,
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
    userId: saver.userId,
    pageId,
    slug,
    croppedPathname,
    parsedContent: parseResult.parsedContent,
    pageType: parseResult.pageType,
    originalHtml: parseResult.domContent,
    canonicalUrl: parseResult.canonicalUrl,
  })
  // check if the page already exists
  const existingPage = await getPageByParam({
    userId: saver.userId,
    url: articleToSave.url,
  })
  // save state
  const archivedAt =
    input.state === ArticleSavingRequestStatus.Archived ? new Date() : null
  // add labels to page
  const labels = input.labels
    ? await createLabels(ctx, input.labels)
    : undefined

  if (existingPage) {
    pageId = existingPage.id
    slug = existingPage.slug
    if (
      !(await updatePage(
        existingPage.id,
        {
          // update the page with the new content
          ...articleToSave,
          archivedAt, // unarchive if it was archived
          id: pageId, // we don't want to update the id
          slug, // we don't want to update the slug
          createdAt: existingPage.createdAt, // we don't want to update the createdAt
          labels,
        },
        ctx
      ))
    ) {
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to update existing page',
      }
    }
  } else if (shouldParseInBackend(input)) {
    try {
      await createPageSaveRequest({
        userId: saver.userId,
        url: articleToSave.url,
        pubsub: ctx.pubsub,
        articleSavingRequestId: input.clientRequestId,
        archivedAt,
        labels,
      })
    } catch (e) {
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to create page save request',
      }
    }
  } else {
    const newPageId = await createPage(
      {
        ...articleToSave,
        archivedAt,
        labels,
      },
      ctx
    )
    if (!newPageId) {
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to create new page',
      }
    }
    pageId = newPageId
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
    url: `${homePageURL()}/${saver.username}/${slug}`,
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
    url: normalizeUrl(canonicalUrl || url, {
      stripHash: true,
      stripWWW: false,
    }),
    pageType,
    hash: uploadFileHash || stringToHash(parsedContent?.content || url),
    image: parsedContent?.previewImage ?? undefined,
    publishedAt: validatedDate(parsedContent?.publishedDate ?? undefined),
    uploadFileId,
    readingProgressPercent: 0,
    readingProgressAnchorIndex: 0,
    state: ArticleSavingRequestStatus.Succeeded,
    createdAt: saveTime || new Date(),
    savedAt: saveTime || new Date(),
    siteName: parsedContent?.siteName ?? undefined,
    language: parsedContent?.language ?? undefined,
    siteIcon: parsedContent?.siteIcon ?? undefined,
    wordsCount: wordsCount(parsedContent?.textContent || ''),
  }
}
