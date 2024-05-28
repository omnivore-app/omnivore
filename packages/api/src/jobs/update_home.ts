import { LibraryItem } from '../entity/library_item'
import { PublicItem } from '../entity/public_item'
import { Subscription } from '../entity/subscription'
import { User } from '../entity/user'
import { redisDataSource } from '../redis_data_source'
import { findUnseenPublicItems } from '../services/home'
import { searchLibraryItems } from '../services/library_item'
import { Feature, getScores, ScoreApiResponse } from '../services/score'
import { findSubscriptionsByNames } from '../services/subscriptions'
import { findActiveUser } from '../services/user'
import { lanaugeToCode } from '../utils/helpers'
import { logger } from '../utils/logger'

export const UPDATE_HOME_JOB = 'UPDATE_HOME_JOB'

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
  score?: number
  publishedAt?: Date
  subscription?: {
    name: string
    type: string
  }
}

interface Item {
  id: string
  type: string
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
  score: item.score,
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
  },
})

const selectCandidates = async (user: User): Promise<Array<Candidate>> => {
  const userId = user.id
  // get last 100 library items saved and not seen by user
  const libraryItems = await searchLibraryItems(
    {
      size: 100,
      includeContent: false,
      query: `-is:seen wordsCount:>0`,
    },
    userId
  )

  logger.info(`Found ${libraryItems.length} library items`)

  // get subscriptions for the library items
  const subscriptionNames = libraryItems
    .filter((item) => !!item.subscription)
    .map((item) => item.subscription as string)

  const subscriptions = await findSubscriptionsByNames(
    userId,
    subscriptionNames
  )

  // map library items to candidates and limit to 70
  const privateCandidates: Array<Candidate> = libraryItems
    .map((item) => libraryItemToCandidate(item, subscriptions))
    .slice(0, 70)
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
    // no need to rank if there are less than 10 candidates
    return candidates
  }

  const unscoredCandidates = candidates.filter(
    (item) => item.score === undefined
  )

  const data = {
    user_id: userId,
    items: unscoredCandidates.reduce((acc, item) => {
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

export const getHomeSections = async (
  userId: string,
  limit: number,
  maxScore?: number
): Promise<Array<{ member: Section; score: number }>> => {
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

  const sections = []
  for (let i = 0; i < results.length; i += 2) {
    const member = JSON.parse(results[i]) as Section
    const score = Number(results[i + 1])
    sections.push({ member, score })
  }

  return sections
}

const appendSectionsToHome = async (
  userId: string,
  sections: Array<Section>,
  cursor = Date.now()
) => {
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const key = redisKey(userId)

  // store candidates in redis sorted set
  const pipeline = redisClient.pipeline()

  const offset = sections.length + 86_400_000
  cursor = cursor - offset

  const scoreMembers = sections.flatMap((section, index) => [
    cursor + index + 86_400_000, // sections expire in 24 hours
    JSON.stringify(section),
  ])

  // add section to the sorted set
  pipeline.zadd(key, ...scoreMembers)

  // remove expired sections and keep only the top 500
  pipeline.zremrangebyrank(key, 0, -(MAX_FEED_ITEMS + 1))
  pipeline.zremrangebyscore(key, '-inf', Date.now())

  logger.info('Adding home sections to redis')
  await pipeline.exec()
}

const mixHomeItems = (rankedHomeItems: Array<Candidate>): Array<Section> => {
  // find the median word count
  const wordCounts = rankedHomeItems.map((item) => item.wordCount)
  wordCounts.sort((a, b) => a - b)
  const medianWordCount = wordCounts[Math.floor(wordCounts.length / 2)]
  // separate items into two groups based on word count
  const shortItems: Array<Candidate> = []
  const longItems: Array<Candidate> = []
  for (const item of rankedHomeItems) {
    if (item.wordCount < medianWordCount) {
      shortItems.push(item)
    } else {
      longItems.push(item)
    }
  }
  // initialize empty batches
  const batches: Array<Array<Candidate>> = Array.from(
    { length: Math.floor(rankedHomeItems.length / 10) },
    () => []
  )

  const checkConstraints = (batch: Array<Candidate>, item: Candidate) => {
    const titleCount = batch.filter((i) => i.title === item.title).length
    const authorCount = batch.filter((i) => i.author === item.author).length
    const siteCount = batch.filter((i) => i.siteName === item.siteName).length
    const subscriptionCount = batch.filter(
      (i) => i.subscription?.name === item.subscription?.name
    ).length

    return (
      titleCount < 1 &&
      authorCount < 2 &&
      siteCount < 2 &&
      subscriptionCount < 2
    )
  }

  const distributeItems = (
    items: Array<Candidate>,
    batches: Array<Array<Candidate>>
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
          if (batch.length < 10) {
            batch.push(item)
            break
          }
        }
      }
    }
  }

  // distribute quick link items first
  distributeItems(shortItems, batches)
  distributeItems(longItems, batches)

  // convert batches to sections
  const sections = []
  for (const batch of batches) {
    // create a section for all quick links
    sections.push({
      items: batch.slice(0, 5).map((item) => ({
        id: item.id,
        type: item.type,
      })),
      layout: 'quick links',
    })

    // create a section for each long item
    sections.push(
      ...batch.slice(5).map((item) => ({
        items: [{ id: item.id, type: item.type }],
        layout: 'long',
      }))
    )
  }

  return sections
}

export const updateHome = async (data: UpdateHomeJobData) => {
  const { userId, cursor } = data
  logger.info('Updating home for user', data)

  const user = await findActiveUser(userId)
  if (!user) {
    logger.error(`User ${userId} not found`)
    return
  }

  logger.info(`Updating home for user ${userId}`)

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

  logger.info('Mix home items to create sections')
  const rankedSections = mixHomeItems(rankedCandidates)
  logger.info(`Created ${rankedSections.length} sections`)

  logger.info('Appending sections to home')
  await appendSectionsToHome(userId, rankedSections, cursor)
  logger.info('Home updated for user', { userId })
}
