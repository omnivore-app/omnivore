import { LibraryItem } from '../entity/library_item'
import { PublicItem } from '../entity/public_item'
import { redisDataSource } from '../redis_data_source'
import { searchLibraryItems } from '../services/library_item'
import { findUnseenPublicItems } from '../services/public_item'
import { logger } from '../utils/logger'

interface JustReadFeedUpdateData {
  userId: string
}

interface Candidate {
  id: string
  title: string
  url: string
  thumbnail?: string
  previewContent?: string
  languageCode?: string
  author?: string
  dir?: string
  publishedAt?: Date
  subscription?: string
}

const libraryItemToCandidate = (item: LibraryItem): Candidate => ({
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
})

const publicItemToCandidate = (item: PublicItem): Candidate => ({
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
})

const selectCandidates = async (userId: string): Promise<Array<Candidate>> => {
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
  const privateCandidates: Array<Candidate> = libraryItems.map(
    libraryItemToCandidate
  )

  // get candidates from public inventory
  const publicItems = await findUnseenPublicItems(userId, {
    limit: 100,
  })

  // map public items to candidates
  const publicCandidates: Array<Candidate> = publicItems.map(
    publicItemToCandidate
  )

  // combine candidates
  return [...privateCandidates, ...publicCandidates]
}

const rankCandidates = async (
  candidates: Array<Candidate>
): Promise<Array<Candidate>> => {
  if (candidates.length <= 10) {
    return candidates
  }

  // TODO: rank candidates
  const API_URL = 'https://rank.omnivore.app'

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ candidates }),
  })

  if (!response.ok) {
    throw new Error(`Failed to rank candidates: ${response.statusText}`)
  }

  return response.json() as Promise<Array<Candidate>>
}

const prependCandidatesToFeed = async (
  candidates: Array<Candidate>,
  userId: string
) => {
  const redisKey = `just-read-feed:${userId}`
  const redisClient = redisDataSource.redisClient
  if (!redisClient) {
    throw new Error('Redis client not available')
  }

  const pipeline = redisClient.pipeline()
  candidates.forEach((candidate) =>
    pipeline.lpush(redisKey, JSON.stringify(candidate))
  )
  await pipeline.exec()
}

const updateJustReadFeed = async (data: JustReadFeedUpdateData) => {
  const { userId } = data
  logger.info(`Updating just read feed for user ${userId}`)

  const candidates = await selectCandidates(userId)
  logger.info(`Found ${candidates.length} candidates`)

  // TODO: integrity check on candidates?

  const rankedCandidates = await rankCandidates(candidates)

  await prependCandidatesToFeed(rankedCandidates, userId)
}
