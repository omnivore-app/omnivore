import { redisDataSource } from '../redis_data_source'
import {
  ReadingProgressCacheItem,
  fetchCachedReadingPosition,
  keyForCachedReadingPosition,
  pushCachedReadingPosition,
} from '../services/cached_reading_position'

export class ReadingProgressDataSource {
  private cacheItems: { [id: string]: ReadingProgressCacheItem } = {}

  async getReadingProgress(
    uid: string,
    libraryItemID: string
  ): Promise<ReadingProgressCacheItem | undefined> {
    const cacheKey = `omnivore:reading-progress:${uid}:${libraryItemID}`
    const cached = this.cacheItems[cacheKey]
    if (cached) {
      return cached
    }
    return fetchCachedReadingPosition(uid, libraryItemID)
  }

  async updateReadingProgress(
    uid: string,
    libraryItemID: string,
    progress: {
      readingProgressPercent: number
      readingProgressTopPercent: number | undefined
      readingProgressAnchorIndex: number | undefined
    }
  ): Promise<void> {
    const cacheItem: ReadingProgressCacheItem = {
      uid,
      libraryItemID,
      updatedAt: new Date().toISOString(),
      ...progress,
    }
    const cacheKey = keyForCachedReadingPosition(uid, libraryItemID)
    pushCachedReadingPosition(uid, libraryItemID, cacheItem)

    this.cacheItems[cacheKey] = cacheItem
    if (
      await redisDataSource.redisClient?.lpush(
        cacheKey,
        JSON.stringify(cacheItem)
      )
    ) {
      console.log('cached reading progress', cacheKey)
    } else {
      console.log('failed to cache reading progress')
    }
  }
}
