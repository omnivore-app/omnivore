import * as privateIpLib from 'private-ip'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { User } from '../entity/user'
import {
  ArticleSavingRequestStatus,
  CreateArticleSavingRequestErrorCode,
  CreateLabelInput,
  PageType,
} from '../generated/graphql'
import { createPubSubClient, PubsubClient } from '../pubsub'
import { Merge } from '../util'
import { enqueueParseRequest } from '../utils/createTask'
import { cleanUrl, generateSlug } from '../utils/helpers'
import { logger } from '../utils/logger'
import { countBySavedAt, createOrUpdateLibraryItem } from './library_item'

interface PageSaveRequest {
  user: User
  url: string
  pubsub?: PubsubClient
  articleSavingRequestId?: string
  state?: ArticleSavingRequestStatus
  labels?: CreateLabelInput[]
  priority?: 'low' | 'high'
  locale?: string
  timezone?: string
  savedAt?: Date
  publishedAt?: Date
  folder?: string
  subscription?: string
}

const SAVING_CONTENT = 'Your link is being saved...'

const isPrivateIP = privateIpLib.default

// 5 items saved in the last minute: use low queue
// default: use normal queue
const getPriorityByRateLimit = async (
  userId: string
): Promise<'low' | 'high'> => {
  const count = await countBySavedAt(userId, new Date(Date.now() - 60 * 1000))
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
  user,
  url,
  pubsub = createPubSubClient(),
  articleSavingRequestId,
  state,
  priority,
  labels,
  locale,
  timezone,
  savedAt,
  publishedAt,
  folder,
  subscription,
}: PageSaveRequest): Promise<LibraryItem> => {
  try {
    validateUrl(url)
  } catch (error) {
    logger.error('invalid url', { url, error })

    return Promise.reject({
      errorCode: CreateArticleSavingRequestErrorCode.BadData,
    })
  }

  const userId = user.id
  url = cleanUrl(url)

  // create processing item
  const libraryItem = await createOrUpdateLibraryItem(
    {
      id: articleSavingRequestId || undefined,
      user: { id: userId },
      readableContent: SAVING_CONTENT,
      itemType: PageType.Unknown,
      slug: generateSlug(url),
      title: url,
      originalUrl: url,
      state: LibraryItemState.Processing,
      publishedAt,
      folder,
      subscription,
      savedAt,
    },
    userId,
    pubsub
  )

  // get priority by checking rate limit if not specified
  priority = priority || (await getPriorityByRateLimit(userId))

  // enqueue task to parse item
  await enqueueParseRequest({
    url,
    userId,
    saveRequestId: libraryItem.id,
    priority,
    state,
    labels,
    locale,
    timezone,
    savedAt,
    publishedAt,
    folder,
    rssFeedUrl: subscription,
  })

  return libraryItem
}
