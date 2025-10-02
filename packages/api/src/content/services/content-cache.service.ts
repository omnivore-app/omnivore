/**
 * Content Cache Service
 *
 * Handles caching of raw content and processed results to improve performance
 * and reduce load on external services.
 */

import { createHash } from 'crypto'
import { redisDataSource } from '../../redis_data_source'
import { logger as baseLogger } from '../../utils/logger'
import {
  RawContent,
  ContentProcessorResult,
  CacheKey,
  CachedContent,
  ExtractionOptions,
} from '../types'
import { ContentType } from '../../events/content/content-save-event'

export class ContentCacheService {
  private logger = baseLogger.child({ context: 'content-cache-service' })
  private defaultTTL = 24 * 60 * 60 // 24 hours in seconds
  private maxCacheSize = 100 * 1024 * 1024 // 100MB max content size

  /**
   * Generate cache key for content
   */
  private generateCacheKey(
    url: string,
    contentType: ContentType,
    options: ExtractionOptions
  ): string {
    const optionsHash = createHash('md5')
      .update(JSON.stringify(options))
      .digest('hex')

    const urlHash = createHash('md5').update(url).digest('hex')

    return `content:${contentType}:${urlHash}:${optionsHash}`
  }

  /**
   * Get cached content
   */
  async get(
    url: string,
    contentType: ContentType,
    options: ExtractionOptions = {}
  ): Promise<RawContent | null> {
    if (!redisDataSource.redisClient) {
      this.logger.debug('Redis client not available, skipping cache')
      return null
    }

    try {
      const cacheKey = this.generateCacheKey(url, contentType, options)
      const cached = await redisDataSource.redisClient.get(cacheKey)

      if (!cached) {
        this.logger.debug('Cache miss', { url, contentType, cacheKey })
        return null
      }

      const parsedContent: CachedContent = JSON.parse(cached)

      // Check if cache is expired
      if (
        Date.now() - parsedContent.timestamp.getTime() >
        parsedContent.ttl * 1000
      ) {
        this.logger.debug('Cache expired', { url, contentType, cacheKey })
        await this.delete(url, contentType, options)
        return null
      }

      this.logger.info('Cache hit', { url, contentType, cacheKey })

      // Mark content as from cache
      const content = parsedContent.content
      content.metadata = {
        ...content.metadata,
        fromCache: true,
        cacheTimestamp: parsedContent.timestamp,
      }

      return content
    } catch (error) {
      this.logger.error('Cache get error', {
        url,
        contentType,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Set cached content
   */
  async set(
    url: string,
    contentType: ContentType,
    options: ExtractionOptions,
    content: RawContent,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    if (!redisDataSource.redisClient) {
      this.logger.debug('Redis client not available, skipping cache')
      return
    }

    try {
      // Check content size
      const contentSize = JSON.stringify(content).length
      if (contentSize > this.maxCacheSize) {
        this.logger.error('Content too large for cache', {
          url,
          contentType,
          size: contentSize,
          maxSize: this.maxCacheSize,
        })
        return
      }

      const cacheKey = this.generateCacheKey(url, contentType, options)
      const cachedContent: CachedContent = {
        key: { url, contentType, options: JSON.stringify(options) },
        content,
        timestamp: new Date(),
        ttl,
      }

      await redisDataSource.redisClient.setex(
        cacheKey,
        ttl,
        JSON.stringify(cachedContent)
      )

      this.logger.info('Content cached', {
        url,
        contentType,
        cacheKey,
        ttl,
        size: contentSize,
      })
    } catch (error) {
      this.logger.error('Cache set error', {
        url,
        contentType,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Delete cached content
   */
  async delete(
    url: string,
    contentType: ContentType,
    options: ExtractionOptions = {}
  ): Promise<void> {
    if (!redisDataSource.redisClient) {
      return
    }

    try {
      const cacheKey = this.generateCacheKey(url, contentType, options)
      await redisDataSource.redisClient.del(cacheKey)

      this.logger.debug('Cache deleted', { url, contentType, cacheKey })
    } catch (error) {
      this.logger.error('Cache delete error', {
        url,
        contentType,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Check if content is cached
   */
  async exists(
    url: string,
    contentType: ContentType,
    options: ExtractionOptions = {}
  ): Promise<boolean> {
    if (!redisDataSource.redisClient) {
      return false
    }

    try {
      const cacheKey = this.generateCacheKey(url, contentType, options)
      const exists = await redisDataSource.redisClient.exists(cacheKey)
      return exists === 1
    } catch (error) {
      this.logger.error('Cache exists check error', {
        url,
        contentType,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number
    memoryUsage: number
    hitRate: number
  }> {
    if (!redisDataSource.redisClient) {
      return { totalKeys: 0, memoryUsage: 0, hitRate: 0 }
    }

    try {
      const info = await redisDataSource.redisClient.info('memory')
      const keyspace = await redisDataSource.redisClient.info('keyspace')

      // Parse memory usage
      const memoryMatch = info.match(/used_memory:(\d+)/)
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1], 10) : 0

      // Parse total keys (simplified)
      const keysMatch = keyspace.match(/keys=(\d+)/)
      const totalKeys = keysMatch ? parseInt(keysMatch[1], 10) : 0

      // Hit rate would need to be tracked separately
      const hitRate = 0 // TODO: Implement hit rate tracking

      return { totalKeys, memoryUsage, hitRate }
    } catch (error) {
      this.logger.error('Cache stats error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return { totalKeys: 0, memoryUsage: 0, hitRate: 0 }
    }
  }

  /**
   * Clear all cached content (use with caution)
   */
  async clear(): Promise<void> {
    if (!redisDataSource.redisClient) {
      return
    }

    try {
      const keys = await redisDataSource.redisClient.keys('content:*')
      if (keys.length > 0) {
        await redisDataSource.redisClient.del(...keys)
        this.logger.info('Cache cleared', { deletedKeys: keys.length })
      }
    } catch (error) {
      this.logger.error('Cache clear error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
