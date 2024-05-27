import { LibraryItem } from '../entity/library_item'
import { PublicItem } from '../entity/public_item'
import { User } from '../entity/user'
import { JustReadFeedSection } from '../generated/graphql'
import { redisDataSource } from '../redis_data_source'
import { findUnseenPublicItems } from '../services/just_read_feed'
import { searchLibraryItems } from '../services/library_item'
import { Feature, getScores, ScoreApiResponse } from '../services/score'
import { findActiveUser } from '../services/user'
import { lanaugeToCode } from '../utils/helpers'
import { logger } from '../utils/logger'

export const UPDATE_JUST_READ_FEED_JOB = 'UPDATE_JUST_READ_FEED_JOB'

export interface UpdateJustReadFeedJobData {
  userId: string
}

interface FeedItem {
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
  siteIcon?: string
  siteName?: string
  saveCount?: number
  likeCount?: number
  broadcastCount?: number
  folder?: string
  subscriptionType: string
  score?: number
  subscription: {
    id: string
    name: string
    icon?: string
  }
}

const libraryItemToCandidate = (user: User, item: LibraryItem): FeedItem => ({
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
  siteName: item.siteName || undefined,
  siteIcon: item.siteIcon || undefined,
  folder: item.folder,
  subscriptionType: 'library',
  score: item.score,
  subscription: {
    id: user.id,
    name: user.name,
    icon: user.profile.pictureUrl || undefined,
  },
})

const publicItemToCandidate = (item: PublicItem): FeedItem => ({
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
  wordCount: item.wordCount,
  siteName: item.siteName,
  saveCount: item.stats.saveCount,
  likeCount: item.stats.likeCount,
  broadcastCount: item.stats.broadcastCount,
  siteIcon: item.siteIcon,
  subscriptionType: item.type,
  subscription: {
    id: item.source.id,
    name: item.source.name,
    icon: item.source.icon,
  },
})

const selectCandidates = async (user: User): Promise<Array<FeedItem>> => {
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

  // map library items to candidates and limit to 70
  const privateCandidates: Array<FeedItem> = libraryItems
    .map((libraryItem) => libraryItemToCandidate(user, libraryItem))
    .slice(0, 70)
  const privateCandidatesSize = privateCandidates.length

  logger.info(`Found ${privateCandidatesSize} private candidates`)

  // get 100 items not seen by the user from public inventory
  const publicItems = await findUnseenPublicItems(userId, {
    limit: 100,
  })

  logger.info(`Found ${publicItems.length} public items`)

  // map public items to candidates and limit to the remaining vacancies
  const publicCandidates: Array<FeedItem> = publicItems
    .map(publicItemToCandidate)
    .slice(0, 100 - privateCandidatesSize)

  const publicCandidatesSize = publicCandidates.length
  logger.info(`Found ${publicCandidatesSize} public candidates`)

  // return 100 candidates and 70 from private and 30 from public
  return [...privateCandidates, ...publicCandidates]
}

const rankCandidates = async (
  userId: string,
  candidates: Array<FeedItem>
): Promise<Array<FeedItem>> => {
  if (candidates.length <= 10) {
    // no need to rank if there are less than 10 candidates
    return candidates
  }

  const unscoredCandidates = candidates.filter(
    (item) => item.score === undefined
  )

  const data = {
    user_id: userId,
    item_features: unscoredCandidates.reduce((acc, item) => {
      acc[item.id] = {
        title: item.title,
        has_thumbnail: !!item.thumbnail,
        has_site_icon: !!item.subscription.icon,
        saved_at: item.date,
        site: item.siteName,
        language: item.languageCode,
        directionality: item.dir,
        folder: item.subscription.name,
        subscription_type: item.subscriptionType,
        author: item.author,
        word_count: item.wordCount,
      } as Feature
      return acc
    }, {} as Record<string, Feature>),
  }

  const newScores = await getScores(data)
  const preCalculatedScores = candidates
    .filter((item) => item.score !== undefined)
    .reduce((acc, item) => {
      acc[item.id] = item.score as number
      return acc
    }, {} as ScoreApiResponse)
  const scores = { ...preCalculatedScores, ...newScores }

  // rank candidates by score in ascending order
  candidates.sort((a, b) => {
    const scoreA = scores[a.id] || 0
    const scoreB = scores[b.id] || 0

    return scoreA - scoreB
  })

  return candidates
}

const redisKey = (userId: string) => `just-read-feed:${userId}`
const MAX_FEED_ITEMS = 500

export const getJustReadFeedSections = async (
  userId: string,
  limit: number,
  minScore?: number
): Promise<Array<{ member: JustReadFeedSection; score: number }>> => {
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const key = redisKey(userId)

  // get feed items from redis sorted set in descending order
  // with score greater than minScore
  // limit to the first `limit` items
  // response is an array of [member1, score1, member2, score2, ...]
  const results = await redisClient.zrevrangebyscore(
    key,
    '+inf',
    minScore || '-inf',
    'WITHSCORES',
    'LIMIT',
    0,
    limit
  )

  const sections = []
  for (let i = 0; i < results.length; i += 2) {
    const member = JSON.parse(results[i]) as JustReadFeedSection
    const score = Number(results[i + 1])
    sections.push({ member, score })
  }

  return sections
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

  const scoreMembers = sections.flatMap((section) => [
    Date.now() + 86_400_000, // sections expire in 24 hours
    JSON.stringify(section),
  ])
  // add section to the sorted set
  pipeline.zadd(key, ...scoreMembers)

  // remove expired sections and keep only the top 500
  pipeline.zremrangebyrank(key, 0, -(MAX_FEED_ITEMS + 1))
  pipeline.zremrangebyscore(key, '-inf', Date.now())

  logger.info('Adding feed sections to redis')
  await pipeline.exec()
}

const mixFeedItems = (
  rankedFeedItems: Array<FeedItem>
): Array<JustReadFeedSection> => {
  // find the median word count
  const wordCounts = rankedFeedItems.map((item) => item.wordCount || 0)
  wordCounts.sort()
  const medianWordCount = wordCounts[Math.floor(wordCounts.length / 2)]
  // separate items into two groups based on word count
  const shortItems: Array<FeedItem> = []
  const longItems: Array<FeedItem> = []
  for (const item of rankedFeedItems) {
    if (item.wordCount && item.wordCount < medianWordCount) {
      shortItems.push(item)
    } else {
      longItems.push(item)
    }
  }
  // initialize empty batches
  const batches = [[]]

  const checkConstraints = (batch: Array<FeedItem>, item: FeedItem) => {
    const titleCount = batch.filter((i) => i.title === item.title).length
    const authorCount = batch.filter((i) => i.author === item.author).length
    const siteCount = batch.filter((i) => i.siteName === item.siteName).length
    const subscriptionCount = batch.filter(
      (i) => i.subscription.name === item.subscription.name
    ).length

    return (
      titleCount < 1 &&
      authorCount < 2 &&
      siteCount < 2 &&
      subscriptionCount < 2
    )
  }

  const distributeItems = (
    items: Array<FeedItem>,
    batches: Array<Array<FeedItem>>
  ) => {
    for (const item of items) {
      let added = false
      for (const batch of batches) {
        if (batch.length < 5 && checkConstraints(batch, item)) {
          batch.push(item)
          added = true
          break
        }
      }

      if (!added) {
        for (const batch of batches) {
          if (batch.length < 5) {
            batch.push(item)
            break
          }
        }
      }
    }
  }

  // distribute longer items first and then shorter items
  distributeItems(longItems, batches)
  distributeItems(shortItems, batches)

  // convert batches to sections
  const sections = []
  for (const batch of batches) {
    // create a section for each long item
    for (let i = 0; i < 5; i++) {
      const section: JustReadFeedSection = {
        items: [batch[i]],
        layout: 'long',
      }
      sections.push(section)
    }
    // create a section for short items
    sections.push({
      items: batch.slice(5),
      layout: 'quick links',
    })
  }

  return sections
}

export const updateJustReadFeed = async (data: UpdateJustReadFeedJobData) => {
  const { userId } = data
  const user = await findActiveUser(userId)
  if (!user) {
    logger.error(`User ${userId} not found`)
    return
  }

  logger.info(`Updating just read feed for user ${userId}`)

  const candidates = await selectCandidates(user)
  logger.info(`Found ${candidates.length} candidates`)

  // TODO: integrity check on candidates

  logger.info('Ranking candidates')
  const rankedCandidates = await rankCandidates(userId, candidates)
  if (rankedCandidates.length === 0) {
    logger.info('No candidates found')
    return
  }

  // TODO: filter candidates

  logger.info('Mix feed items to create sections')
  const rankedSections = mixFeedItems(rankedCandidates)
  logger.info(`Created ${rankedSections.length} sections`)

  logger.info('Appending feed items to feed')
  await appendSectionsToFeed(userId, rankedSections)
  logger.info('Feed updated for user', { userId })
}
