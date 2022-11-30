import { PubsubClient } from '../datalayer/pubsub'
import { homePageURL } from '../env'
import {
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

import normalizeUrl from 'normalize-url'
import { createPageSaveRequest } from './create_page_save_request'
import { ArticleSavingRequestStatus, Page, PageType } from '../elastic/types'
import { createPage, getPageByParam, updatePage } from '../elastic/pages'
import { addHighlightToPage } from '../elastic/highlights'
import { Readability } from '@omnivore/readability'

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
  const [slug, croppedPathname] = createSlug(input.url, input.title)
  const parseResult = await parsePreparedContent(input.url, {
    document: input.originalContent,
    pageInfo: {
      title: input.title,
      canonicalUrl: input.url,
    },
  })

  const articleToSave = parsedContentToPage({
    url: input.url,
    title: input.title,
    userId: saver.userId,
    pageId: input.clientRequestId,
    slug,
    croppedPathname,
    parsedContent: parseResult.parsedContent,
    pageType: parseResult.pageType,
    originalHtml: parseResult.domContent,
    canonicalUrl: parseResult.canonicalUrl,
  })

  let pageId: string | undefined = undefined
  const existingPage = await getPageByParam({
    userId: saver.userId,
    url: articleToSave.url,
    state: ArticleSavingRequestStatus.Succeeded,
  })

  if (existingPage) {
    pageId = existingPage.id
    if (
      !(await updatePage(
        existingPage.id,
        {
          savedAt: new Date(),
          archivedAt: null,
        },
        ctx
      ))
    ) {
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to update existing page',
      }
    }
    input.clientRequestId = existingPage.id
  } else if (shouldParseInBackend(input)) {
    try {
      await createPageSaveRequest(
        saver.userId,
        input.url,
        ctx.models,
        ctx.pubsub,
        input.clientRequestId
      )
    } catch (e) {
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to create page save request',
      }
    }
  } else {
    pageId = await createPage(articleToSave, ctx)
    if (!pageId) {
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to create new page',
      }
    }
  }

  if (pageId && parseResult.highlightData) {
    const highlight = {
      updatedAt: new Date(),
      createdAt: new Date(),
      userId: ctx.uid,
      elasticPageId: pageId,
      ...parseResult.highlightData,
    }

    if (
      !(await addHighlightToPage(pageId, highlight, {
        pubsub: ctx.pubsub,
        uid: ctx.uid,
      }))
    ) {
      return {
        errorCodes: [SaveErrorCode.EmbeddedHighlightFailed],
        message: 'Failed to save highlight',
      }
    }
  }

  return {
    clientRequestId: input.clientRequestId,
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
    author: parsedContent?.byline,
    url: normalizeUrl(canonicalUrl || url, {
      stripHash: true,
      stripWWW: false,
    }),
    pageType,
    hash: uploadFileHash || stringToHash(parsedContent?.content || url),
    image: parsedContent?.previewImage,
    publishedAt: validatedDate(parsedContent?.publishedDate),
    uploadFileId: uploadFileId,
    readingProgressPercent: 0,
    readingProgressAnchorIndex: 0,
    state: ArticleSavingRequestStatus.Succeeded,
    createdAt: saveTime || new Date(),
    savedAt: saveTime || new Date(),
    siteName: parsedContent?.siteName,
    language: parsedContent?.language,
    siteIcon: parsedContent?.siteIcon,
    wordsCount: wordsCount(parsedContent?.textContent || ''),
  }
}
