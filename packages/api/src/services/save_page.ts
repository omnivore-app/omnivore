import { PubsubClient } from '../datalayer/pubsub'
import { homePageURL } from '../env'
import {
  Maybe,
  SaveErrorCode,
  SavePageInput,
  SaveResult,
} from '../generated/graphql'
import { DataModels } from '../resolvers/types'
import { generateSlug, stringToHash, validatedDate } from '../utils/helpers'
import { parsePreparedContent } from '../utils/parser'

import normalizeUrl from 'normalize-url'
import { createPageSaveRequest } from './create_page_save_request'
import { ArticleSavingRequestStatus, Page } from '../elastic/types'
import { createPage, getPageByParam, updatePage } from '../elastic/pages'

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

  const articleToSave: Page = {
    id: input.clientRequestId,
    slug,
    userId: saver.userId,
    originalHtml: parseResult.domContent,
    content: parseResult.parsedContent?.content || '',
    description: parseResult.parsedContent?.excerpt,
    title: parseResult.parsedContent?.title || input.title || croppedPathname,
    author: parseResult.parsedContent?.byline,
    url: normalizeUrl(parseResult.canonicalUrl || input.url, {
      stripHash: true,
      stripWWW: false,
    }),
    pageType: parseResult.pageType,
    hash: stringToHash(parseResult.parsedContent?.content || input.url),
    image: parseResult.parsedContent?.previewImage,
    publishedAt: validatedDate(parseResult.parsedContent?.publishedDate),
    readingProgressPercent: 0,
    readingProgressAnchorIndex: 0,
    state: ArticleSavingRequestStatus.Succeeded,
    createdAt: new Date(),
    savedAt: new Date(),
  }

  const existingPage = await getPageByParam({
    userId: saver.userId,
    url: articleToSave.url,
    state: ArticleSavingRequestStatus.Succeeded,
  })
  if (existingPage) {
    if (
      !(await updatePage(
        existingPage.id,
        {
          savedAt: new Date(),
          archivedAt: undefined,
        },
        ctx
      ))
    ) {
      console.log('FAILED TO UPDATE EXISTING PAGE WITH', input)
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to update existing page',
      }
    }
    input.clientRequestId = existingPage.id
  } else if (shouldParseInBackend(input)) {
    await createPageSaveRequest(
      saver.userId,
      input.url,
      ctx.models,
      ctx.pubsub,
      input.clientRequestId
    )
  } else {
    if (!(await createPage(articleToSave, ctx))) {
      console.log('FAILED TO CREATE PAGE WITH INPUT', input)
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to create new page',
      }
    }
  }

  return {
    clientRequestId: input.clientRequestId,
    url: `${homePageURL()}/${saver.username}/${slug}`,
  }
}
