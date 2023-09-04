import * as privateIpLib from 'private-ip'
import { v4 as uuidv4 } from 'uuid'
import { LibraryItemState, LibraryItemType } from '../entity/library_item'
import {
  ArticleSavingRequest,
  ArticleSavingRequestStatus,
  CreateArticleSavingRequestErrorCode,
  CreateLabelInput,
} from '../generated/graphql'
import { createPubSubClient, PubsubClient } from '../pubsub'
import { userRepository } from '../repository/user'
import { enqueueParseRequest } from '../utils/createTask'
import {
  cleanUrl,
  generateSlug,
  libraryItemToArticleSavingRequest,
} from '../utils/helpers'
import { logger } from '../utils/logger'
import {
  countByCreatedAt,
  createLibraryItem,
  findLibraryItemByUrl,
  updateLibraryItem,
} from './library_item'

interface PageSaveRequest {
  userId: string
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
}

const SAVING_CONTENT = 'Your link is being saved...'

const isPrivateIP = privateIpLib.default

// 5 articles added in the last minute: use low queue
// default: use normal queue
const getPriorityByRateLimit = async (
  userId: string
): Promise<'low' | 'high'> => {
  const count = await countByCreatedAt(new Date(Date.now() - 60 * 1000))
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
  state,
  priority,
  labels,
  locale,
  timezone,
  savedAt,
  publishedAt,
}: PageSaveRequest): Promise<ArticleSavingRequest> => {
  try {
    validateUrl(url)
  } catch (error) {
    logger.info('invalid url', { url, error })
    return Promise.reject({
      errorCode: CreateArticleSavingRequestErrorCode.BadData,
    })
  }
  // if user is not specified, get it from the database
  const user = await userRepository.findById(userId)
  if (!user) {
    logger.info('User not found', userId)
    return Promise.reject({
      errorCode: CreateArticleSavingRequestErrorCode.BadData,
    })
  }

  url = cleanUrl(url)
  // look for existing library item
  let libraryItem = await findLibraryItemByUrl(url, userId)
  if (!libraryItem) {
    logger.info('libraryItem does not exist', { url })

    // create processing page
    libraryItem = await createLibraryItem(
      {
        id: articleSavingRequestId,
        user: { id: userId },
        readableContent: SAVING_CONTENT,
        itemType: LibraryItemType.Unknown,
        slug: generateSlug(url),
        title: url,
        originalUrl: url,
        state: LibraryItemState.Processing,
        publishedAt,
      },
      userId,
      pubsub
    )
  }
  // reset state to processing
  if (libraryItem.state !== LibraryItemState.Processing) {
    libraryItem = await updateLibraryItem(
      libraryItem.id,
      {
        state: LibraryItemState.Processing,
      },
      userId,
      pubsub
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
    state,
    labels,
    locale,
    timezone,
    savedAt,
    publishedAt,
  })

  return libraryItemToArticleSavingRequest(user, libraryItem)
}
