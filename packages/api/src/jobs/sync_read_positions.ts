import Redis from 'ioredis'
import { redisDataSource } from '../redis_data_source'
import {
  CACHED_READING_POSITION_PREFIX,
  componentsForCachedReadingPositionKey,
  fetchCachedReadingPositionsAndMembers,
  reduceCachedReadingPositionMembers,
} from '../services/cached_reading_position'
import { updateLibraryItemReadingProgress } from '../services/library_item'
import { logger } from '../utils/logger'

export const SYNC_READ_POSITIONS_JOB_NAME = 'sync-read-positions'

async function* getSyncUpdatesIterator(redis: Redis) {
  const match = `${CACHED_READING_POSITION_PREFIX}:*`
  let [cursor, batch]: [string | number, string[]] = [0, []]
  do {
    ;[cursor, batch] = await redis.scan(cursor, 'MATCH', match, 'COUNT', 100)
    if (batch.length) {
      for (const key of batch) {
        yield key
      }
    }
  } while (cursor !== '0')
  return
}

const isMoreThan60SecondsOld = (iso8601String: string): boolean => {
  const currentTime = new Date()
  const parsedDate = new Date(iso8601String)
  const timeDifferenceInSeconds =
    (currentTime.getTime() - parsedDate.getTime()) / 1000
  return timeDifferenceInSeconds > 60
}

const syncReadPosition = async (cacheKey: string) => {
  const components = componentsForCachedReadingPositionKey(cacheKey)
  const positions = components
    ? await fetchCachedReadingPositionsAndMembers(
        components.uid,
        components.libraryItemID
      )
    : undefined
  if (
    components &&
    positions &&
    positions.positionItems &&
    positions.positionItems.length > 0 &&
    positions.positionItems[0].updatedAt &&
    isMoreThan60SecondsOld(positions.positionItems[0].updatedAt)
  ) {
    const position = reduceCachedReadingPositionMembers(
      components.uid,
      components.libraryItemID,
      positions.positionItems
    )
    if (position) {
      // this will throw if there is an error
      await updateLibraryItemReadingProgress(
        components.libraryItemID,
        components.uid,
        position.readingProgressPercent,
        position.readingProgressTopPercent,
        position.readingProgressAnchorIndex
      )
    }

    const removed = await redisDataSource.redisClient?.srem(
      cacheKey,
      ...positions.members
    )
    if (!removed || removed < positions.members.length) {
      logger.warning(
        'potential error, reading position cache key members not removed',
        { cacheKey }
      )
    }
  }
}

export const syncReadPositionsJob = async (_data: any) => {
  const redis = redisDataSource.redisClient
  if (!redis) {
    throw new Error('unable to sync reading position, no redis client')
  }

  const updates = getSyncUpdatesIterator(redis)
  for await (const value of updates) {
    try {
      await syncReadPosition(value)
    } catch (error) {
      logger.error('error syncing reading position', { error, value })
    }
  }
}
