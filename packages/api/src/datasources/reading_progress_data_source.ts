import { redisDataSource } from '../redis_data_source'

type ReadingProgressCacheItem = {
  readingProgressPercent: number
  readingProgressTopPercent: number | undefined
  readingProgressAnchorIndex: number | undefined
  updatedAt: string
}

export class ReadingProgressDataSource {
  private cacheItems: { [id: string]: ReadingProgressCacheItem } = {}

  constructor() {}

  async getReadingProgress(
    uid: string,
    libraryItemID: string
  ): Promise<ReadingProgressCacheItem | undefined> {
    const cacheKey = `omnivore:reading-progress:${uid}:${libraryItemID}`
    const cached = this.cacheItems[cacheKey]
    if (cached) {
      return cached
    }
    return this.valueFromRedis(cacheKey)
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
    const cacheKey = `omnivore:reading-progress:${uid}:${libraryItemID}`
    const cacheItem: ReadingProgressCacheItem = {
      ...progress,
      updatedAt: new Date().toISOString(),
    }

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

  async valueFromRedis(
    cacheKey: string
  ): Promise<ReadingProgressCacheItem | undefined> {
    const redisCached = await redisDataSource.redisClient?.lrange(
      cacheKey,
      0,
      0
    )
    if (redisCached && redisCached.length > 0) {
      return JSON.parse(redisCached[0])
    }
    return undefined
  }
}
