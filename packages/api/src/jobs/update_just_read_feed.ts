import { LibraryItem } from '../entity/library_item'
import { PublicItem } from '../entity/public_item'
import { redisDataSource } from '../redis_data_source'
import { findUnseenPublicItems } from '../services/just_read_feed'
import { searchLibraryItems } from '../services/library_item'
import { logger } from '../utils/logger'

export const UPDATE_JUST_READ_FEED_JOB = 'UPDATE_JUST_READ_FEED_JOB'

export interface UpdateJustReadFeedJobData {
  userId: string
}

interface JustReadFeedItem {
  id: string
  title: string
  url: string
  topic: string
  thumbnail?: string
  previewContent?: string
  languageCode?: string
  author?: string
  dir?: string
  publishedAt?: Date
  subscription?: string
}

interface JustReadFeedTopic {
  name: string
  items: Array<JustReadFeedItem>
  thumbnail: string
}

interface JustReadFeed {
  topics: Array<JustReadFeedTopic>
}

const libraryItemToFeedItem = (item: LibraryItem): JustReadFeedItem => ({
  id: item.id,
  title: item.title,
  url: item.originalUrl,
  thumbnail: item.thumbnail || undefined,
  previewContent: item.description || undefined,
  languageCode: item.itemLanguage || undefined, // TODO: map to language code
  author: item.author || undefined,
  dir: item.directionality || undefined,
  publishedAt: item.publishedAt || undefined,
  subscription: item.subscription || undefined,
  topic: item.topic,
})

const publicItemToFeedItem = (item: PublicItem): JustReadFeedItem => ({
  id: item.id,
  title: item.title,
  url: item.url,
  thumbnail: item.thumbnail,
  previewContent: item.previewContent,
  languageCode: item.languageCode,
  author: item.author,
  dir: item.dir,
  publishedAt: item.publishedAt,
  subscription: item.source_name,
  topic: item.topic,
})

const selectCandidates = async (
  userId: string
): Promise<Array<JustReadFeedItem>> => {
  // get last 100 library items saved and not seen by user
  const libraryItems = await searchLibraryItems(
    {
      size: 100,
      includeContent: false,
      query: `-is:seen`,
    },
    userId
  )

  // map library items to candidates
  const privateCandidates: Array<JustReadFeedItem> = libraryItems.map(
    libraryItemToFeedItem
  )

  // get candidates from public inventory
  const publicItems = await findUnseenPublicItems(userId, {
    limit: 100,
  })

  // map public items to candidates
  const publicCandidates: Array<JustReadFeedItem> =
    publicItems.map(publicItemToFeedItem)

  // combine candidates
  return [...privateCandidates, ...publicCandidates]
}

const rankFeedItems = async (
  feedItems: Array<JustReadFeedItem>
): Promise<Array<JustReadFeedItem>> => {
  if (feedItems.length <= 10) {
    return feedItems
  }

  // TODO: rank candidates
  const API_URL = 'https://rank.omnivore.app'

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ candidates: feedItems }),
  })

  if (!response.ok) {
    throw new Error(`Failed to rank candidates: ${response.statusText}`)
  }

  return response.json() as Promise<Array<JustReadFeedItem>>
}

const redisKey = (userId: string) => `just-read-feed:${userId}`

export const getJustReadFeed = async (
  userId: string,
  limit: number,
  offset: number
): Promise<JustReadFeed> => {
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const key = redisKey(userId)

  const results = await redisClient.lrange(key, offset, offset + limit - 1)

  const feedItems = results.map((item) => JSON.parse(item) as JustReadFeedItem)

  const topics: Array<JustReadFeedTopic> = []

  feedItems.forEach((item) => {
    const topic = topics.find((topic) => topic.name === item.topic)
    if (topic) {
      topic.items.push(item)
    } else {
      topics.push({
        name: item.topic,
        thumbnail: item.thumbnail || '',
        items: [item],
      })
    }
  })

  return { topics }
}

const prependItemsToFeed = async (
  candidates: Array<JustReadFeedItem>,
  userId: string
) => {
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const key = redisKey(userId)

  const pipeline = redisClient.pipeline()
  candidates.forEach((candidate) =>
    pipeline.lpush(key, JSON.stringify(candidate))
  )
  // keep only the first 100 items
  pipeline.ltrim(key, 0, 99)

  await pipeline.exec()
}

const updateJustReadFeed = async (data: UpdateJustReadFeedJobData) => {
  const { userId } = data
  logger.info(`Updating just read feed for user ${userId}`)

  const feedItems = await selectCandidates(userId)
  logger.info(`Found ${feedItems.length} candidates`)

  // TODO: integrity check on candidates?

  const rankedFeedItems = await rankFeedItems(feedItems)

  await prependItemsToFeed(rankedFeedItems, userId)
}
