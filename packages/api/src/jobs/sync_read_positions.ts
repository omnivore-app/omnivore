import Redis from 'ioredis'
import { redisDataSource } from '../redis_data_source'
import {
  CACHED_READING_POSITION_PREFIX,
  componentsForCachedReadingPositionKey,
  fetchCachedReadingPosition,
} from '../services/cached_reading_position'
import { logger } from '../utils/logger'
import { updateLibraryItemReadingProgress } from '../services/library_item'

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

const syncReadPosition = async (cacheKey: string) => {
  const components = componentsForCachedReadingPositionKey(cacheKey)
  const position = components
    ? await fetchCachedReadingPosition(components.uid, components.libraryItemID)
    : undefined
  if (components && position) {
    const result = await updateLibraryItemReadingProgress(
      components.libraryItemID,
      components.uid,
      position.readingProgressPercent,
      position.readingProgressTopPercent,
      position.readingProgressAnchorIndex
    )
    if (!result) {
      logger.error('unable to update reading progress', { cacheKey })
    }
  } else {
    logger.warning(
      'potential error, reading position cache key found with no data',
      { cacheKey }
    )
  }
  // Even if there are errors above we want to delete the key, otherwise
  // in error scenarios we could accumulate a huge number of keys for
  // something that is not critical (reading position)
  const result = await redisDataSource.redisClient?.del(cacheKey)
  if (!result || result < 1) {
    logger.warning('error deleting cache key', { cacheKey })
  }
}

export const syncReadPositionsJob = async (data: any, attempts: number) => {
  const redis = redisDataSource.redisClient
  if (!redis) {
    throw new Error('unable to sync reading position, no redis client')
  }

  const updates = getSyncUpdatesIterator(redis)
  for await (const value of updates) {
    await syncReadPosition(value)
  }
}
