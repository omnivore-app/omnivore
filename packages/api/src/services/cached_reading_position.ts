import { redisDataSource } from '../redis_data_source'
import { logger } from '../utils/logger'

export const CACHED_READING_POSITION_PREFIX = `omnivore:reading-progress`

export type ReadingProgressCacheItem = {
  uid: string
  libraryItemID: string
  readingProgressPercent: number
  readingProgressTopPercent: number | undefined
  readingProgressAnchorIndex: number | undefined
  updatedAt: string | undefined
}

export const isReadingProgressCacheItem = (
  item: any
): item is ReadingProgressCacheItem => {
  return (
    'uid' in item && 'libraryItemID' in item && 'readingProgressPercent' in item
  )
}

export const parseReadingProgressCacheItem = (
  item: any
): ReadingProgressCacheItem | undefined => {
  const result = JSON.parse(item) as unknown
  if (isReadingProgressCacheItem(result)) {
    return result
  }
  return undefined
}

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
    logger.error('exception getting cache key components', { cacheKey, error })
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
    // Its critical that the date is set so the entry will be a unique
    // set value.
    position.updatedAt = new Date().toISOString()
    const result = await redisDataSource.redisClient?.sadd(
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
  try {
    const items = await fetchCachedReadingPositionsAndMembers(
      uid,
      libraryItemID
    )
    if (!items) {
      return undefined
    }
    return reduceCachedReadingPositionMembers(
      uid,
      libraryItemID,
      items.positionItems
    )
  } catch (error) {
    logger.error('exception looking up cached reading position', {
      uid,
      libraryItemID,
      error,
    })
  }
  return undefined
}

export const reduceCachedReadingPositionMembers = (
  uid: string,
  libraryItemID: string,
  items: ReadingProgressCacheItem[]
): ReadingProgressCacheItem | undefined => {
  try {
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
        'readingProgressTopPercent' in o ? o.readingProgressTopPercent ?? 0 : 0
      )
    )
    const anchor = Math.max(
      ...items.map((o) =>
        'readingProgressAnchorIndex' in o
          ? o.readingProgressAnchorIndex ?? 0
          : 0
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
    logger.error('exception reducing cached reading items', {
      uid,
      libraryItemID,
      error,
    })
  }
  return undefined
}

export const fetchCachedReadingPositionsAndMembers = async (
  uid: string,
  libraryItemID: string
): Promise<
  { positionItems: ReadingProgressCacheItem[]; members: string[] } | undefined
> => {
  const cacheKey = keyForCachedReadingPosition(uid, libraryItemID)
  try {
    const members = await redisDataSource.redisClient?.smembers(cacheKey)
    if (!members) {
      return undefined
    }
    const positionItems = members
      ?.map((item) => parseReadingProgressCacheItem(item))
      .filter(isReadingProgressCacheItem)
    return { members, positionItems }
  } catch (error) {
    logger.error('exception looking up cached reading position', {
      cacheKey,
      error,
    })
  }
  return undefined
}
