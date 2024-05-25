import languages from '@cospired/i18n-iso-languages'
import { LibraryItem } from '../entity/library_item'
import { PublicItem } from '../entity/public_item'
import { User } from '../entity/user'
import {
  JustReadFeedItem,
  JustReadFeedSection,
  JustReadFeedSuccess,
} from '../generated/graphql'
import { redisDataSource } from '../redis_data_source'
import { findUnseenPublicItems } from '../services/just_read_feed'
import { searchLibraryItems } from '../services/library_item'
import { findActiveUser } from '../services/user'
import { logger } from '../utils/logger'

export const UPDATE_JUST_READ_FEED_JOB = 'UPDATE_JUST_READ_FEED_JOB'

export interface UpdateJustReadFeedJobData {
  userId: string
}

interface Feature {
  title: string
  has_thumbnail: boolean
  has_site_icon: boolean
  saved_at: Date
  site?: string
  language?: string
  author?: string
  directionality: string
  word_count?: number
  subscription_type: string
  folder: string
}

interface ScoreApiRequestBody {
  user_id: string
  item_features: Record<string, Feature> // item_id -> feature
}

interface Candidate {
  id: string
  title: string
  url: string
  thumbnail?: string
  previewContent?: string
  languageCode: string
  author?: string
  dir: string
  date: Date
  topic?: string
  wordCount?: number
  sourceIcon?: string
  siteName?: string
  subscription: {
    id: string
    name: string
    icon?: string
  }
}

const lanaugeToCode = (language: string): string =>
  languages.getAlpha2Code(language, 'en') || 'en'

const libraryItemToFeedItem = (
  user: User,
  item: LibraryItem
): JustReadFeedItem => ({
  id: item.id,
  title: item.title,
  url: item.originalUrl,
  thumbnail: item.thumbnail || undefined,
  previewContent: item.description || undefined,
  languageCode: lanaugeToCode(item.itemLanguage || 'English'),
  author: item.author || undefined,
  dir: item.directionality || 'ltr',
  date: item.createdAt,
  topic: item.topic,
  wordCount: item.wordCount || undefined,
  sourceIcon: user.profile.pictureUrl || undefined,
  siteName: item.siteName || undefined,
  subscription: {
    id: user.id,
    name: user.name,
    icon: user.profile.pictureUrl || undefined,
  },
})

const publicItemToFeedItem = (item: PublicItem): JustReadFeedItem => ({
  id: item.id,
  title: item.title,
  url: item.url,
  thumbnail: item.thumbnail,
  previewContent: item.previewContent,
  languageCode: item.languageCode || 'en',
  author: item.author,
  dir: item.dir || 'ltr',
  date: item.createdAt,
  topic: item.topic,
  wordCount: item.wordCount || undefined,
  siteName: item.siteName,
  updatedAt: item.updatedAt,
  saveCount: item.stats.saveCount,
  likeCount: item.stats.likeCount,
  broadcastCount: item.stats.broadcastCount,
})

type ScoreApiResponse = Record<string, number> // item_id -> score

const selectCandidates = async (
  user: User
): Promise<Array<JustReadFeedItem>> => {
  const userId = user.id
  // get last 100 library items saved and not seen by user
  const libraryItems = await searchLibraryItems(
    {
      size: 100,
      includeContent: false,
      query: `-is:seen`,
    },
    userId
  )

  logger.info(`Found ${libraryItems.length} library items`)

  // map library items to candidates
  const privateCandidates: Array<JustReadFeedItem> = libraryItems.map(
    (libraryItem) => libraryItemToFeedItem(user, libraryItem)
  )

  logger.info(`Found ${privateCandidates.length} private candidates`)

  // get candidates from public inventory
  const publicItems = await findUnseenPublicItems(userId, {
    limit: 100,
  })

  logger.info(`Found ${publicItems.length} public items`)

  // map public items to candidates
  const publicCandidates: Array<JustReadFeedItem> =
    publicItems.map(publicItemToFeedItem)

  logger.info(`Found ${publicCandidates.length} public candidates`)

  // combine candidates
  return [...privateCandidates, ...publicCandidates]
}

const rankFeedItems = async (
  userId: string,
  feedItems: Array<JustReadFeedItem>
): Promise<Array<JustReadFeedItem>> => {
  if (feedItems.length <= 10) {
    // no need to rank if there are less than 10 candidates
    return feedItems
  }

  // TODO: get score of candidates
  const API_URL = 'http://127.0.0.1:5000/predictions'
  const requestBody: ScoreApiRequestBody = {
    user_id: userId,
    item_features: feedItems.reduce((acc, item) => {
      acc[item.id] = {
        title: item.title,
        has_thumbnail: !!item.thumbnail,
        has_site_icon: !!item.sourceIcon,
        saved_at: item.date,
        site: item.siteName,
        language: item.languageCode,
      } as Feature
      return acc
    }, {} as Record<string, Feature>),
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`Failed to score candidates: ${response.statusText}`)
  }

  const scores = (await response.json()) as ScoreApiResponse

  // // fake scores
  // const scores: Array<FeedItemScore> = feedItems.map((item) => ({
  //   id: item.id,
  //   score: Math.random(),
  // }))

  // rank candidates by score in ascending order
  feedItems.sort((a, b) => {
    const scoreA = scores[a.id] || 0
    const scoreB = scores[b.id] || 0

    return scoreA - scoreB
  })

  return Promise.resolve(feedItems)
}

const redisKey = (userId: string) => `just-read-feed:${userId}`
const MAX_FEED_ITEMS = 500

export const getJustReadFeed = async (
  userId: string,
  first = 10,
  after?: string
): Promise<JustReadFeedSuccess> => {
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const key = redisKey(userId)

  const results = await redisClient.zrevrange(key, 0, first - 1, 'WITHSCORES')

  const sections = JSON.parse(results.join(',')) as JustReadFeedSection[]

  return { sections }
}

const appendSectionsToFeed = async (
  userId: string,
  sections: Array<JustReadFeedSection>
) => {
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const key = redisKey(userId)

  // store candidates in redis sorted set
  const pipeline = redisClient.pipeline()

  const scoreMembers = sections.flatMap((item) => [
    Date.now() + 86_400_000, // sections expire in 24 hours
    JSON.stringify(item),
  ])
  // add section to the sorted set
  pipeline.zadd(key, ...scoreMembers)

  // remove expired sections and keep only the top 500
  pipeline.zremrangebyrank(key, 0, -(MAX_FEED_ITEMS + 1))
  pipeline.zremrangebyscore(key, '-inf', Date.now())

  logger.info('Adding feed sections to redis')
  await pipeline.exec()
}

export const updateJustReadFeed = async (data: UpdateJustReadFeedJobData) => {
  const { userId } = data
  const user = await findActiveUser(userId)
  if (!user) {
    logger.error(`User ${userId} not found`)
    return
  }

  logger.info(`Updating just read feed for user ${userId}`)

  const feedItems = await selectCandidates(user)
  logger.info(`Found ${feedItems.length} candidates`)

  // TODO: integrity check on candidates?

  logger.info('Ranking feed items')
  const rankedFeedItems = await rankFeedItems(userId, feedItems)
  if (rankedFeedItems.length === 0) {
    logger.info('No feed items to append')
    return
  }

  logger.info('Filtering feed items')
  // TODO: filtering
  // get top 100 ranked feed items
  const filteredFeedItems = rankedFeedItems.slice(0, 100)

  logger.info('Appending feed items to feed')
  await appendSectionsToFeed(userId, filteredFeedItems)
}
