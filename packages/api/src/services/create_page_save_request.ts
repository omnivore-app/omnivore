import * as privateIpLib from 'private-ip'
import { v4 as uuidv4 } from 'uuid'
import { countByCreatedAt, createPage, updatePage } from '../elastic/pages'
import { ArticleSavingRequestStatus, PageType } from '../elastic/types'
import { LibraryItemState } from '../entity/library_item'
import { User } from '../entity/user'
import {
  ArticleSavingRequest,
  CreateArticleSavingRequestErrorCode,
  CreateLabelInput
} from '../generated/graphql'
import { createPubSubClient, PubsubClient } from '../pubsub'
import { libraryItemRepository } from '../repository/library_item'
import { userRepository } from '../repository/user'
import { enqueueParseRequest } from '../utils/createTask'
import {
  cleanUrl,
  generateSlug,
  pageToArticleSavingRequest
} from '../utils/helpers'
import { logger } from '../utils/logger'

interface PageSaveRequest {
  userId: string
  url: string
  pubsub?: PubsubClient
  articleSavingRequestId?: string
  archivedAt?: Date | null
  labels?: CreateLabelInput[]
  priority?: 'low' | 'high'
  user?: User | null
  locale?: string
  timezone?: string
  savedAt?: Date
  publishedAt?: Date
}

const SAVING_CONTENT = 'Your link is being saved...'

const isPrivateIP = privateIpLib.default

// 5 articles added in the last minute: use low queue
// default: use normal queue
const getPriorityByRateLimit = async (
  userId: string
): Promise<'low' | 'high'> => {
  const count = await countByCreatedAt(userId, Date.now() - 60 * 1000)
  return count >= 5 ? 'low' : 'high'
}

export const validateUrl = (url: string): URL => {
  const u = new URL(url)
  // Make sure the URL is http or https
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Invalid URL')
  }
  // Make sure the domain is not localhost
  if (u.hostname === 'localhost' || u.hostname === '0.0.0.0') {
    throw new Error('Invalid URL')
  }
  // Make sure its not a private GCP domain
  if (
    u.hostname == 'metadata.google.internal' ||
    /^169.254.*/.test(u.hostname)
  ) {
    throw new Error('Invalid URL')
  }
  // // Make sure the domain is not a private IP
  // if (/^(10|172\.16|192\.168)\..*/.test(u.hostname)) {
  //   throw new Error('Invalid URL')
  // }
  if (isPrivateIP(u.hostname)) {
    throw new Error('Invalid URL')
  }
  return u
}

export const createPageSaveRequest = async ({
  userId,
  url,
  pubsub = createPubSubClient(),
  articleSavingRequestId = uuidv4(),
  archivedAt,
  priority,
  labels,
  user,
  locale,
  timezone,
  savedAt,
  publishedAt,
}: PageSaveRequest): Promise<ArticleSavingRequest> => {
  try {
    validateUrl(url)
  } catch (error) {
    logger.error('invalid url', { url, error })
    return Promise.reject({
      errorCode: CreateArticleSavingRequestErrorCode.BadData,
    })
  }
  // if user is not specified, get it from the database
  if (!user) {
    user = await userRepository.findById(userId)
    if (!user) {
      logger.info('User not found', userId)
      return Promise.reject({
        errorCode: CreateArticleSavingRequestErrorCode.BadData,
      })
    }
  }

  url = cleanUrl(url)
  // look for existing library item
  const existingLibraryItem = await libraryItemRepository.findByUrl(url)
  if (!existingLibraryItem) {
    logger.info('libraryItem does not exist', { url })
    libraryItem = {
      id: articleSavingRequestId,
      user: { id: userId },
      content: SAVING_CONTENT,
      hash: '',
      pageType: PageType.Unknown,
      readingProgressAnchorIndex: 0,
      readingProgressPercent: 0,
      slug: generateSlug(url),
      title: url,
      url,
      state: LibraryItemState.Processing,
      createdAt: new Date(),
      savedAt: savedAt || new Date(),
      publishedAt,
      archivedAt,
    }

    // create processing page
    const pageId = await createPage(page, ctx)
    if (!pageId) {
      logger.info('Failed to create page', url)
      return Promise.reject({
        errorCode: CreateArticleSavingRequestErrorCode.BadData,
      })
    }
  }
  // reset state to processing
  if (existingLibraryItem.state !== ArticleSavingRequestStatus.Processing) {
    await updatePage(
      page.id,
      {
        state: ArticleSavingRequestStatus.Processing,
      },
      ctx
    )
  }

  // get priority by checking rate limit if not specified
  priority = priority || (await getPriorityByRateLimit(userId))

  // enqueue task to parse page
  await enqueueParseRequest({
    url,
    userId,
    saveRequestId: articleSavingRequestId,
    priority,
    state: archivedAt ? ArticleSavingRequestStatus.Archived : undefined,
    labels,
    locale,
    timezone,
    savedAt,
    publishedAt,
  })

  return pageToArticleSavingRequest(user, page)
}
