import Redis from 'ioredis'
import { redisDataSource } from '../redis_data_source'
import {
  CACHED_READING_POSITION_PREFIX,
  componentsForCachedReadingPositionKey,
  fetchCachedReadingPositionsAndMembers,
  reduceCachedReadingPositionMembers,
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
    positions.positionItems.length > 0
  ) {
    const position = await reduceCachedReadingPositionMembers(
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
  } else {
    logger.warning(
      'potential error, reading position cache key found with no data',
      { cacheKey }
    )
  }
}

export const syncReadPositionsJob = async (_data: any) => {
  const redis = redisDataSource.redisClient
  if (!redis) {
    throw new Error('unable to sync reading position, no redis client')
  }

  const updates = getSyncUpdatesIterator(redis)
  for await (const value of updates) {
    await syncReadPosition(value)
  }
}
