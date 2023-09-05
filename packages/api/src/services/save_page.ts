import { Readability } from '@omnivore/readability'
import { DeepPartial } from 'typeorm'
import {
  LibraryItem,
  LibraryItemState,
  LibraryItemType,
} from '../entity/library_item'
import { User } from '../entity/user'
import { homePageURL } from '../env'
import {
  ArticleSavingRequestStatus,
  HighlightType,
  Maybe,
  PreparedDocumentInput,
  SaveErrorCode,
  SavePageInput,
  SaveResult,
} from '../generated/graphql'
import { authTrx } from '../repository'
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
import { saveHighlight } from './highlights'
import { findOrCreateLabels } from './labels'
import { createLibraryItem, updateLibraryItem } from './library_item'

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
  input: SavePageInput,
  user: User
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
  let clientRequestId = input.clientRequestId

  const itemToSave = parsedContentToLibraryItem({
    url: input.url,
    title: input.title,
    userId: user.id,
    itemId: clientRequestId,
    slug,
    croppedPathname,
    parsedContent: parseResult.parsedContent,
    itemType: parseResult.pageType as unknown as LibraryItemType,
    originalHtml: parseResult.domContent,
    canonicalUrl: parseResult.canonicalUrl,
    saveTime: input.savedAt ? new Date(input.savedAt) : undefined,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
    state: input.state || undefined,
  })
  const isImported = input.source === 'csv-importer'

  // always parse in backend if the url is in the force puppeteer list
  if (shouldParseInBackend(input)) {
    try {
      await createPageSaveRequest({
        userId: user.id,
        url: itemToSave.originalUrl,
        articleSavingRequestId: clientRequestId,
        state: input.state || undefined,
        labels: input.labels || undefined,
      })
    } catch (e) {
      return {
        errorCodes: [SaveErrorCode.Unknown],
        message: 'Failed to create page save request',
      }
    }
  } else {
    // save state
    itemToSave.archivedAt =
      input.state === ArticleSavingRequestStatus.Archived ? new Date() : null
    // add labels to page
    itemToSave.labels = input.labels
      ? await findOrCreateLabels(input.labels, user.id)
      : undefined

    // check if the page already exists
    const existingLibraryItem = await authTrx((t) =>
      t.getRepository(LibraryItem).findOne({
        where: { user: { id: user.id }, originalUrl: itemToSave.originalUrl },
        relations: ['subscription'],
      })
    )
    if (existingLibraryItem) {
      // we don't want to update an rss feed page if rss-feeder is tring to re-save it
      if (
        existingLibraryItem.subscription &&
        existingLibraryItem.subscription.url === input.rssFeedUrl
      ) {
        return {
          clientRequestId,
          url: `${homePageURL()}/${user.profile.username}/${slug}`,
        }
      }

      clientRequestId = existingLibraryItem.id
      slug = existingLibraryItem.slug
      if (!(await updateLibraryItem(clientRequestId, itemToSave, user.id))) {
        return {
          errorCodes: [SaveErrorCode.Unknown],
          message: 'Failed to update existing page',
        }
      }
    } else {
      // do not publish a pubsub event if the page is imported
      const newItem = await createLibraryItem(itemToSave, user.id)
      clientRequestId = newItem.id
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
      userId: user.id,
      ...parseResult.highlightData,
      type: HighlightType.Highlight,
    }

    if (!(await saveHighlight(highlight, user.id))) {
      return {
        errorCodes: [SaveErrorCode.EmbeddedHighlightFailed],
        message: 'Failed to save highlight',
      }
    }
  }

  return {
    clientRequestId,
    url: `${homePageURL()}/${user.profile.username}/${slug}`,
  }
}

// convert parsed content to an library item
export const parsedContentToLibraryItem = ({
  url,
  userId,
  originalHtml,
  itemId,
  parsedContent,
  slug,
  croppedPathname,
  title,
  preparedDocument,
  canonicalUrl,
  itemType,
  uploadFileHash,
  uploadFileId,
  saveTime,
  publishedAt,
  state,
}: {
  url: string
  userId: string
  slug: string
  croppedPathname: string
  itemType: LibraryItemType
  parsedContent: Readability.ParseResult | null
  originalHtml?: string | null
  itemId?: string | null
  title?: string | null
  preparedDocument?: PreparedDocumentInput | null
  canonicalUrl?: string | null
  uploadFileHash?: string | null
  uploadFileId?: string | null
  saveTime?: Date
  publishedAt?: Date | null
  state?: ArticleSavingRequestStatus | null
}): DeepPartial<LibraryItem> & { originalUrl: string } => {
  return {
    id: itemId || undefined,
    slug,
    user: { id: userId },
    originalContent: originalHtml,
    readableContent: parsedContent?.content || '',
    description: parsedContent?.excerpt,
    title:
      title ||
      parsedContent?.title ||
      preparedDocument?.pageInfo.title ||
      croppedPathname ||
      parsedContent?.siteName ||
      url,
    author: parsedContent?.byline,
    originalUrl: cleanUrl(canonicalUrl || url),
    itemType,
    textContentHash:
      uploadFileHash || stringToHash(parsedContent?.content || url),
    thumbnail: parsedContent?.previewImage ?? undefined,
    publishedAt: validatedDate(
      publishedAt || parsedContent?.publishedDate || undefined
    ),
    uploadFile: { id: uploadFileId ?? undefined },
    readingProgressTopPercent: 0,
    readingProgressHighestReadAnchor: 0,
    state: state
      ? (state as unknown as LibraryItemState)
      : LibraryItemState.Succeeded,
    createdAt: validatedDate(saveTime),
    savedAt: validatedDate(saveTime),
    siteName: parsedContent?.siteName,
    itemLanguage: parsedContent?.language,
    siteIcon: parsedContent?.siteIcon,
    wordCount: wordsCount(parsedContent?.textContent || ''),
  }
}
