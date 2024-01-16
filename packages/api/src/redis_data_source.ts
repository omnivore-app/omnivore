import Redis, { RedisOptions } from 'ioredis'
import { env } from './env'

export type RedisDataSourceOptions = {
  REDIS_URL?: string
  REDIS_CERT?: string
}

export class RedisDataSource {
  options: RedisDataSourceOptions
  isInitialized: Boolean

  ioRedisClient: Redis | undefined = undefined

  constructor(options: RedisDataSourceOptions) {
    this.options = options
    this.isInitialized = false
  }

  async initialize(): Promise<this> {
    if (this.isInitialized) throw 'Error already initialized'

    this.ioRedisClient = createIORedisClient(this.options)
    this.isInitialized = true

    return this
  }

  setOptions(options: RedisDataSourceOptions): void {
    this.options = options
  }

  async shutdown(): Promise<void> {
    if (this.ioRedisClient && this.ioRedisClient.status == 'ready') {
      this.ioRedisClient.quit()
    }
  }
}

const createIORedisClient = (
  options: RedisDataSourceOptions
): Redis | undefined => {
  let redisURL = options.REDIS_URL
  if (!redisURL) {
    throw 'Error: no redisURL supplied'
  }
  const redisOptions = (redisURL: string): RedisOptions => {
    if (redisURL.startsWith('rediss://') && options.REDIS_CERT) {
      return {
        tls: {
          ca: options.REDIS_CERT,
          rejectUnauthorized: false,
        },
        connectTimeout: 10000,
        maxRetriesPerRequest: null,
        retryStrategy: (times: number) => {
          return 10
        },
      }
    }
    return {
      connectTimeout: 10000,
      maxRetriesPerRequest: null,
      retryStrategy: (times: number) => {
        console.log('retrying', times)
        if (times > 10) {
          return null
        }
        return 10
      },
    }
  }

  return new Redis(redisURL, redisOptions(redisURL))
}

export const redisDataSource = new RedisDataSource({
  REDIS_URL: env.redis.url,
  REDIS_CERT: env.redis.cert,
})
