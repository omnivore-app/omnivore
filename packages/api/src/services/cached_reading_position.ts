import { redisDataSource } from '../redis_data_source'
import { logger } from '../utils/logger'

export type ReadingProgressCacheItem = {
  uid: string
  libraryItemID: string
  readingProgressPercent: number
  readingProgressTopPercent: number | undefined
  readingProgressAnchorIndex: number | undefined
  updatedAt: string | undefined
}

export const CACHED_READING_POSITION_PREFIX = `omnivore:reading-progress`

export const keyForCachedReadingPosition = (
  uid: string,
  libraryItemID: string
): string => {
  return `${CACHED_READING_POSITION_PREFIX}:${uid}:${libraryItemID}`
}

export const componentsForCachedReadingPositionKey = (
  cacheKey: string
): { uid: string; libraryItemID: string } | undefined => {
  try {
    const [_owner, _prefix, uid, libraryItemID] = cacheKey.split(':')
    return {
      uid,
      libraryItemID,
    }
  } catch (error) {
    logger.log('exception getting cache key components', { cacheKey, error })
  }
  return undefined
}

// Reading positions are cached as an array of positions, when
// we fetch them from the cache we find the maximum values
export const clearCachedReadingPosition = async (
  uid: string,
  libraryItemID: string
): Promise<boolean> => {
  const cacheKey = keyForCachedReadingPosition(uid, libraryItemID)
  try {
    const res = await redisDataSource.redisClient?.del(cacheKey)
    return res ? res > 0 : false
  } catch (error) {
    logger.error('exception clearing cached reading position', {
      cacheKey,
      error,
    })
  }
  return false
}

export const pushCachedReadingPosition = async (
  uid: string,
  libraryItemID: string,
  position: ReadingProgressCacheItem
): Promise<boolean> => {
  const cacheKey = keyForCachedReadingPosition(uid, libraryItemID)
  try {
    const result = await redisDataSource.redisClient?.lpush(
      cacheKey,
      JSON.stringify(position)
    )
    return result ? result > 0 : false
  } catch (error) {
    logger.error('error writing cached reading position', { cacheKey, error })
  }
  return false
}

// Reading positions are cached as an array of positions, when
// we fetch them from the cache we find the maximum values
export const fetchCachedReadingPosition = async (
  uid: string,
  libraryItemID: string
): Promise<ReadingProgressCacheItem | undefined> => {
  console.log('checking uid', uid, 'libraryItemId', libraryItemID)
  const cacheKey = keyForCachedReadingPosition(uid, libraryItemID)
  try {
    const cacheItemList = await redisDataSource.redisClient?.lrange(
      cacheKey,
      0,
      -1
    )
    console.log('cacheItemList: ', cacheKey, cacheItemList)
    const items = cacheItemList?.map((item) => JSON.parse(item))
    console.log(' items[]: ', items)
    if (!items || items.length < 1) {
      return undefined
    }

    const percent = Math.max(
      ...items.map((o) =>
        'readingProgressPercent' in o ? o.readingProgressPercent : 0
      )
    )
    const top = Math.max(
      ...items.map((o) =>
        'readingProgressTopPercent' in o ? o.readingProgressTopPercent : 0
      )
    )
    const anchor = Math.max(
      ...items.map((o) =>
        'readingProgressAnchorIndex' in o ? o.readingProgressAnchorIndex : 0
      )
    )

    return {
      uid,
      libraryItemID,
      readingProgressPercent: percent,
      readingProgressTopPercent: top,
      readingProgressAnchorIndex: anchor,
      updatedAt: undefined,
    }
  } catch (error) {
    logger.error('exception looking up cached reading position', {
      cacheKey,
      error,
    })
  }
  return undefined
}
