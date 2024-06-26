import client from 'prom-client'
import { LibraryItem } from '../entity/library_item'
import { PublicItem } from '../entity/public_item'
import { Subscription, SubscriptionType } from '../entity/subscription'
import { User } from '../entity/user'
import { registerMetric } from '../prometheus'
import { redisDataSource } from '../redis_data_source'
import { findUnseenPublicItems } from '../services/home'
import { searchLibraryItems } from '../services/library_item'
import { Feature, scoreClient } from '../services/score'
import { findSubscriptionsByNames } from '../services/subscriptions'
import { findActiveUser } from '../services/user'
import { lanaugeToCode } from '../utils/helpers'
import { logError, logger } from '../utils/logger'

export const UPDATE_HOME_JOB = 'update-home'

export interface UpdateHomeJobData {
  userId: string
  cursor?: number
}

interface Candidate {
  id: string
  title: string
  url: string
  type: string
  thumbnail?: string
  previewContent?: string
  languageCode: string
  author?: string
  dir: string
  date: Date
  topic?: string
  wordCount: number
  siteIcon?: string
  siteName?: string
  folder?: string
  score: number
  publishedAt?: Date
  subscription?: {
    name: string
    type: string
    autoAddToLibrary?: boolean | null
    createdAt: Date
    fetchContent?: boolean | null
  }
}

interface Item {
  id: string
  type: string
  score: number
}

interface Section {
  items: Array<Item>
  layout: string
}

const libraryItemToCandidate = (
  item: LibraryItem,
  subscriptions: Array<Subscription>
): Candidate => ({
  id: item.id,
  title: item.title,
  url: item.originalUrl,
  type: 'library_item',
  thumbnail: item.thumbnail || undefined,
  previewContent: item.description || undefined,
  languageCode: lanaugeToCode(item.itemLanguage || 'English'),
  author: item.author || undefined,
  dir: item.directionality || 'ltr',
  date: item.createdAt,
  topic: item.topic,
  wordCount: item.wordCount || 0,
  siteName: item.siteName || undefined,
  siteIcon: item.siteIcon || undefined,
  folder: item.folder,
  score: item.score || 0,
  publishedAt: item.publishedAt || undefined,
  subscription: subscriptions.find(
    (subscription) =>
      subscription.name === item.subscription ||
      subscription.url === item.subscription
  ),
})

const publicItemToCandidate = (item: PublicItem): Candidate => ({
  id: item.id,
  title: item.title,
  url: item.url,
  type: 'public_item',
  thumbnail: item.thumbnail,
  previewContent: item.previewContent,
  languageCode: item.languageCode || 'en',
  author: item.author,
  dir: item.dir || 'ltr',
  date: item.createdAt,
  topic: item.topic,
  wordCount: item.wordCount || 0,
  siteIcon: item.siteIcon,
  siteName: item.siteName,
  publishedAt: item.publishedAt,
  subscription: {
    name: item.source.name,
    type: item.source.type,
    createdAt: item.source.createdAt,
  },
  score: 0,
})

const getJustAddedCandidates = async (
  userId: string,
  limit = 5 // limit to 5 just added candidates
): Promise<Array<Candidate>> => {
  const libraryItems = await searchLibraryItems(
    {
      size: limit,
      includeContent: false,
      useFolders: true, // only show items in inbox folder
      query: `in:inbox saved:"this week"`,
    },
    userId
  )

  logger.info(`Found ${libraryItems.length} just added library items`)

  // get subscriptions for the library items
  const subscriptionNames = libraryItems
    .filter((item) => !!item.subscription)
    .map((item) => item.subscription as string)

  const subscriptions = await findSubscriptionsByNames(
    userId,
    subscriptionNames
  )

  // map library items to candidates
  const justAddedCandidates: Array<Candidate> = libraryItems.map((item) =>
    libraryItemToCandidate(item, subscriptions)
  )

  return justAddedCandidates
}

const selectCandidates = async (
  user: User,
  excludes: Array<string> = [],
  limit = 100
): Promise<Array<Candidate>> => {
  const userId = user.id
  // get last 100 library items saved and not seen by user
  const libraryItems = await searchLibraryItems(
    {
      size: limit,
      includeContent: false,
      query: `in:inbox -is:seen -includes:${excludes.join(',')}`,
    },
    userId
  )

  logger.info(`Found ${libraryItems.length} not just added library items`)

  // get subscriptions for the library items
  const subscriptionNames = libraryItems
    .filter((item) => !!item.subscription)
    .map((item) => item.subscription as string)

  const subscriptions = await findSubscriptionsByNames(
    userId,
    subscriptionNames
  )

  // map library items to candidates
  const privateCandidates: Array<Candidate> = libraryItems.map((item) =>
    libraryItemToCandidate(item, subscriptions)
  )
  const privateCandidatesSize = privateCandidates.length

  logger.info(`Found ${privateCandidatesSize} private candidates`)

  // get 100 items not seen by the user from public inventory
  const publicItems = await findUnseenPublicItems(userId, {
    limit: 100,
  })

  logger.info(`Found ${publicItems.length} public items`)

  // map public items to candidates and limit to the remaining vacancies
  const publicCandidates: Array<Candidate> = publicItems
    .map(publicItemToCandidate)
    .slice(0, 100 - privateCandidatesSize)

  const publicCandidatesSize = publicCandidates.length
  logger.info(`Found ${publicCandidatesSize} public candidates`)

  // returns 100 candidates which are a mix of private and public candidates
  return [...privateCandidates, ...publicCandidates]
}

const rankCandidates = async (
  userId: string,
  candidates: Array<Candidate>
): Promise<Array<Candidate>> => {
  if (candidates.length <= 10) {
    logger.info('Not enough candidates to rank')
    return candidates
  }

  const data = {
    user_id: userId,
    items: candidates.reduce((acc, item) => {
      acc[item.id] = {
        library_item_id: item.id,
        title: item.title,
        has_thumbnail: !!item.thumbnail,
        has_site_icon: !!item.siteIcon,
        saved_at: item.date,
        site: item.siteName,
        language: item.languageCode,
        directionality: item.dir,
        folder: item.folder,
        subscription_type: item.subscription?.type,
        author: item.author,
        word_count: item.wordCount,
        published_at: item.publishedAt,
        subscription: item.subscription?.name,
        inbox_folder: item.folder === 'inbox',
        is_feed: item.subscription?.type === SubscriptionType.Rss,
        is_newsletter: item.subscription?.type === SubscriptionType.Newsletter,
        is_subscription: !!item.subscription,
        item_word_count: item.wordCount,
        subscription_count: 0,
        subscription_auto_add_to_library: item.subscription?.autoAddToLibrary,
        subscription_fetch_content: item.subscription?.fetchContent,
        days_since_subscribed: item.subscription
          ? Math.floor(
              (Date.now() - item.subscription.createdAt.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : undefined,
      } as Feature
      return acc
    }, {} as Record<string, Feature>),
  }

  const scores = await scoreClient.getScores(data)
  // update scores for candidates
  candidates.forEach((item) => {
    item.score = scores[item.id]['score'] || 0
  })

  // rank candidates by score in descending order
  candidates.sort((a, b) => b.score - a.score)

  return candidates
}

const redisKey = (userId: string) => `home:${userId}`
const emptyHomeKey = (key: string) => `${key}:empty`

export const getHomeSections = async (
  userId: string,
  limit = 100,
  maxScore?: number
): Promise<Array<{ member: Section; score: number }> | null> => {
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const key = redisKey(userId)

  // get feed items from redis sorted set in descending order
  // with score smalled than maxScore
  // limit to the first `limit` items
  // response is an array of [member1, score1, member2, score2, ...]
  const results = await redisClient.zrevrangebyscore(
    key,
    maxScore ? maxScore - 1 : '+inf',
    '-inf',
    'WITHSCORES',
    'LIMIT',
    0,
    limit
  )

  if (!results.length) {
    logger.info('No sections found in redis')
    // check if the feed is empty
    const isEmpty = await redisClient.exists(emptyHomeKey(key))
    if (isEmpty) {
      logger.info('Empty feed')
      return []
    }

    logger.info('Feed not found')
    return null
  }

  const sections = []
  for (let i = 0; i < results.length; i += 2) {
    const member = JSON.parse(results[i]) as Section
    const score = Number(results[i + 1])
    sections.push({ member, score })
  }

  return sections
}

export const deleteHome = async (userId: string) => {
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const key = redisKey(userId)

  await redisClient.del(key)
}

const appendSectionsToHome = async (
  userId: string,
  sections: Array<Section>,
  cursor?: number
) => {
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const key = redisKey(userId)
  const emptyKey = emptyHomeKey(key)

  if (!sections.length) {
    logger.info('No available sections to add')
    // set expiration to 1 hour
    await redisClient.set(emptyKey, 'true', 'EX', 60 * 60)
    return
  }

  // store candidates in redis sorted set
  const pipeline = redisClient.pipeline()

  const now = Date.now()

  const batchSize = sections.length
  const savedAt = cursor ? cursor - batchSize : now

  const scoreMembers = sections.flatMap((section, index) => [
    savedAt + index, // score for the section is the savedAt + index otherwise it will be the same for all sections
    JSON.stringify(section),
  ])

  // sections expire in 24 hours
  pipeline.expire(key, 24 * 60 * 60)

  // add section to the sorted set
  pipeline.zadd(key, ...scoreMembers)

  pipeline.del(emptyKey)

  // keep only the new sections and remove the oldest ones
  pipeline.zremrangebyrank(key, 0, -(sections.length + 1))

  logger.info('Adding home sections to redis')
  await pipeline.exec()
}

const mixHomeItems = (
  justAddedCandidates: Array<Candidate>,
  rankedHomeItems: Array<Candidate>
): Array<Section> => {
  const checkConstraints = (batch: Array<Candidate>, item: Candidate) => {
    const titleCount = batch.filter((i) => i.title === item.title).length
    const authorCount = batch.filter((i) => i.author === item.author).length
    const siteCount = batch.filter((i) => i.siteName === item.siteName).length
    const subscriptionCount = batch.filter(
      (i) =>
        item.subscription && i.subscription?.name === item.subscription.name
    ).length

    return (
      titleCount < 1 &&
      authorCount < 2 &&
      siteCount < 2 &&
      subscriptionCount < 2
    )
  }

  const candidateToItem = (candidate: Candidate): Item => ({
    id: candidate.id,
    type: candidate.type,
    score: candidate.score,
  })

  const distributeItems = (
    items: Array<Candidate>,
    batches: Array<Array<Candidate>>
  ) => {
    if (batches.length === 0) {
      return
    }

    const batchSize = Math.ceil(items.length / batches.length)

    for (const item of items) {
      let added = false
      for (const batch of batches) {
        if (batch.length < batchSize && checkConstraints(batch, item)) {
          batch.push(item)
          added = true
          break
        }
      }

      if (!added) {
        for (const batch of batches) {
          if (batch.length < batchSize) {
            batch.push(item)
            break
          }
        }
      }
    }
  }

  const topCandidates = rankedHomeItems.slice(0, 50)

  // find the median word count
  const wordCountThreshold = 500
  // separate items into two groups based on word count
  const shortItems: Array<Candidate> = []
  const longItems: Array<Candidate> = []
  for (const item of topCandidates) {
    if (item.wordCount < wordCountThreshold) {
      shortItems.push(item)
    } else {
      longItems.push(item)
    }
  }

  // initialize empty batches
  const numOfBatches = 10
  const batches = {
    short: Array.from({ length: numOfBatches }, () => []) as Array<
      Array<Candidate>
    >,
    long: Array.from({ length: numOfBatches }, () => []) as Array<
      Array<Candidate>
    >,
  }

  batches.short.length && distributeItems(shortItems, batches.short)
  batches.long.length && distributeItems(longItems, batches.long)

  // convert batches to sections
  const sections = []
  const hiddenCandidates = rankedHomeItems.slice(50)

  hiddenCandidates.length &&
    sections.push({
      items: hiddenCandidates.map(candidateToItem),
      layout: 'hidden',
    })

  batches.short.length &&
    sections.push({
      items: batches.short.flat().map(candidateToItem),
      layout: 'quick_links',
    })

  batches.long.length &&
    sections.push({
      items: batches.long.flat().map(candidateToItem),
      layout: 'top_picks',
    })

  justAddedCandidates &&
    sections.push({
      items: justAddedCandidates.map(candidateToItem),
      layout: 'just_added',
    })

  return sections
}

// use prometheus to monitor the latency of each step
const latency = new client.Histogram({
  name: 'omnivore_update_home_latency',
  help: 'Latency of update home job',
  labelNames: ['step'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
})

latency.observe(10)

registerMetric(latency)

export const updateHome = async (data: UpdateHomeJobData) => {
  const { userId, cursor } = data
  logger.info('Updating home for user', data)

  try {
    const user = await findActiveUser(userId)
    if (!user) {
      logger.error(`User ${userId} not found`)
      return
    }

    logger.info(`Updating home for user ${userId}`)

    let end = latency.startTimer({ step: 'justAdded' })
    const justAddedCandidates = await getJustAddedCandidates(userId)
    end()

    logger.info(`Found ${justAddedCandidates.length} just added candidates`)

    end = latency.startTimer({ step: 'select' })
    const candidates = await selectCandidates(
      user,
      justAddedCandidates.map((c) => c.id)
    )
    end()
    logger.info(`Found ${candidates.length} candidates`)

    if (!justAddedCandidates.length && !candidates.length) {
      logger.info('No candidates found')
    }

    // TODO: integrity check on candidates

    end = latency.startTimer({ step: 'ranking' })
    const rankedCandidates = await rankCandidates(userId, candidates)
    end()

    logger.info(`Ranked ${rankedCandidates.length} candidates`)

    end = latency.startTimer({ step: 'mixing' })
    const sections = mixHomeItems(justAddedCandidates, rankedCandidates)
    end()

    logger.info(`Mixed ${sections.length} sections`)

    end = latency.startTimer({ step: 'saving' })
    await appendSectionsToHome(userId, sections, cursor)
    end()

    logger.info('Home updated for user', { userId })
  } catch (error) {
    logError(error)

    throw error
  }
}
