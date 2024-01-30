import { redisDataSource } from '../redis_data_source'

type ReadingProgressCacheItem = {
  readingProgressPercent: number
  readingProgressTopPercent: number | undefined
  readingProgressAnchorIndex: number | undefined
  updatedAt: Date
}

export class ReadingProgressDataSource {
  private cacheItems: { [id: string]: ReadingProgressCacheItem } = {}

  async getReadingProgress(
    libraryItemID: string
  ): Promise<ReadingProgressCacheItem | undefined> {
    const cacheKey = `omnivore:reading-progress:${libraryItemID}`
    const cached = this.cacheItems[cacheKey]
    if (cached) {
      return cached
    }
    return this.valueFromRedis(libraryItemID)
  }

  async updateReadingProgress(
    libraryItemID: string,
    progress: {
      readingProgressPercent: number
      readingProgressTopPercent: number | undefined | null
      readingProgressAnchorIndex: number | undefined | null
    }
  ): Promise<void> {
    const cacheKey = `omnivore:reading-progress:${libraryItemID}`
    const existingItem = await this.valueFromRedis(cacheKey)
    const cacheItem = {
      readingProgressPercent: Math.max(
        progress.readingProgressPercent,
        existingItem?.readingProgressPercent ?? 0
      ),
      readingProgressTopPercent: Math.max(
        progress.readingProgressTopPercent ?? 0,
        existingItem?.readingProgressTopPercent ?? 0
      ),
      readingProgressAnchorIndex: Math.max(
        progress.readingProgressAnchorIndex ?? 0,
        existingItem?.readingProgressAnchorIndex ?? 0
      ),
      updatedAt: new Date(),
    }

    this.cacheItems[cacheKey] = cacheItem
    if (await redisDataSource.redisClient?.hmset(cacheKey, cacheItem)) {
      console.log('cached reading progress')
    } else {
      console.log('failed to cache reading progress')
    }
  }

  async valueFromRedis(
    libraryItemID: string
  ): Promise<ReadingProgressCacheItem | undefined> {
    const cacheKey = `omnivore:reading-progress:${libraryItemID}`
    const redisCached = await redisDataSource.redisClient?.hgetall(cacheKey)
    if (redisCached) {
      const readingProgressPercent = parseInt(
        redisCached.readingProgressPercent,
        10
      )
      const updatedAt = new Date(parseInt(redisCached.updatedAt, 10))
      if (!Number.isNaN(readingProgressPercent) && updatedAt) {
        return {
          readingProgressPercent,
          readingProgressTopPercent: redisCached.readingProgressTopPercent
            ? parseInt(redisCached.readingProgressTopPercent, 10)
            : undefined,
          readingProgressAnchorIndex: redisCached.readingProgressAnchorIndex
            ? parseInt(redisCached.readingProgressAnchorIndex, 10)
            : undefined,
          updatedAt,
        }
      }
    }
    return undefined
  }
}
