// private-ip was ESM-only; use a simple RFC1918 private IP check instead
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { User } from '../entity/user'
import {
  ArticleSavingRequestStatus,
  CreateArticleSavingRequestErrorCode,
  CreateLabelInput,
  PageType,
} from '../generated/graphql'
import { createPubSubClient, PubsubClient } from '../pubsub'
import { redisDataSource } from '../redis_data_source'
import { enqueueFetchContentJob } from '../utils/createTask'
import { cleanUrl, generateSlug } from '../utils/helpers'
import { logger } from '../utils/logger'
import { createOrUpdateLibraryItem } from './library_item'

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

const isPrivateIP = (host: string): boolean => {
  // IPv4 private ranges: 10.0.0.0/8
  if (/^10\./.test(host)) return true
  // 172.16.0.0/12
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true
  // 192.168.0.0/16
  if (/^192\.168\./.test(host)) return true
  return false
}

const recentSavedItemKey = (userId: string) => `recent-saved-item:${userId}`

const addRecentSavedItem = async (userId: string) => {
  const redisClient = redisDataSource.redisClient

  if (redisClient) {
    const key = recentSavedItemKey(userId)
    try {
      // add now to the sorted set for rate limiting
      await redisClient.zadd(key, Date.now(), Date.now())
    } catch (error) {
      logger.error('error adding recently saved item in redis', {
        key,
        error,
      })
    }
  }
}

// 5 items saved in the last minute: use low queue
// default: use normal queue
const getPriorityByRateLimit = async (
  userId: string
): Promise<'low' | 'high'> => {
  const redisClient = redisDataSource.redisClient
  if (redisClient) {
    const oneMinuteAgo = Date.now() - 60 * 1000
    const key = recentSavedItemKey(userId)

    try {
      // Remove items older than one minute
      await redisClient.zremrangebyscore(key, '-inf', oneMinuteAgo)

      // Count items in the last minute
      const count = await redisClient.zcard(key)

      return count >= 5 ? 'low' : 'high'
    } catch (error) {
      logger.error('Failed to get priority by rate limit', { userId, error })
    }
  }

  return 'high'
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

  // add to recent saved item
  await addRecentSavedItem(userId)

  // get priority by checking rate limit if not specified
  priority = priority || (await getPriorityByRateLimit(userId))

  // enqueue task to parse item
  try {
    const contentFetchQueueEnabled =
      process.env.CONTENT_FETCH_QUEUE_ENABLED === 'true'
    if (contentFetchQueueEnabled) {
      await enqueueFetchContentJob({
        url,
        users: [
          {
            folder,
            id: userId,
            libraryItemId: libraryItem.id,
          },
        ],
        priority,
        state,
        labels,
        locale,
        timezone,
        savedAt: savedAt?.toISOString(),
        publishedAt: publishedAt?.toISOString(),
        rssFeedUrl: subscription,
      })
    } else {
      // Fallback to direct HTTP task creation for development/local environments
      const createHttpTaskWithToken = (await import('../utils/createTask'))
        .default
      await createHttpTaskWithToken({
        taskHandlerUrl:
          process.env.CONTENT_FETCH_URL || 'http://localhost:3002',
        payload: {
          url,
          users: [
            {
              folder,
              id: userId,
              libraryItemId: libraryItem.id,
            },
          ],
          priority,
          state,
          labels,
          locale,
          timezone,
          savedAt: savedAt?.toISOString(),
          publishedAt: publishedAt?.toISOString(),
          rssFeedUrl: subscription,
        },
      })
    }
  } catch (error) {
    logger.error('Failed to enqueue fetch content job', { error, url, userId })
    // Don't throw error to avoid blocking the save request
    // The item will remain in processing state and can be retried later
  }

  return libraryItem
}
