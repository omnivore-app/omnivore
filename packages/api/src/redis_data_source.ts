import Redis, { RedisOptions } from 'ioredis'
import { env } from './env'

export type RedisDataSourceOptions = {
  REDIS_URL?: string
  REDIS_CERT?: string
}

export class RedisDataSource {
  options: RedisDataSourceOptions
  isInitialized: boolean

  redisClient: Redis | undefined = undefined
  workerRedisClient: Redis | undefined = undefined

  constructor(options: RedisDataSourceOptions) {
    this.options = options
    this.isInitialized = false
  }

  // Forcing this to be async as we might do some more initialization in the future
  async initialize(): Promise<this> {
    if (this.isInitialized) throw 'Error already initialized'

    this.redisClient = createIORedisClient('app', this.options)
    this.workerRedisClient = createIORedisClient('worker', this.options)
    this.isInitialized = true

    return Promise.resolve(this)
  }

  setOptions(options: RedisDataSourceOptions): void {
    this.options = options
  }

  async shutdown(): Promise<void> {
    this.isInitialized = false
    try {
      await this.workerRedisClient?.quit()
      await this.redisClient?.quit()
    } catch (err) {
      console.error('error while shutting down redis')
    }
  }
}

const createIORedisClient = (
  name: string,
  options: RedisDataSourceOptions
): Redis | undefined => {
  const redisURL = options.REDIS_URL
  if (!redisURL) {
    throw 'Error: no redisURL supplied'
  }
  const tls =
    redisURL.startsWith('rediss://') && options.REDIS_CERT
      ? {
          ca: options.REDIS_CERT,
          rejectUnauthorized: false,
        }
      : undefined

  const redisOptions: RedisOptions = {
    tls,
    name,
    connectTimeout: 10000,
    maxRetriesPerRequest: null,
    offlineQueue: false,
    // reconnectOnError: (err: Error) => {
    //   const targetErrors = [/READONLY/, /ETIMEDOUT/]

    //   targetErrors.forEach((targetError) => {
    //     if (targetError.test(err.message)) {
    //       // Only reconnect when the error contains the keyword
    //       return true
    //     }
    //   })

    //   return false
    // },
    retryStrategy: (times: number) => {
      // if (times > 10) {
      //   // End reconnecting after a specific number of tries and flush all commands with a individual error
      //   return null
      // }

      // // reconnect after
      // return Math.min(times * 50, 2000)
      return 10
    },
  }
  return new Redis(redisURL, redisOptions)
}

export const redisDataSource = new RedisDataSource({
  REDIS_URL: env.redis.url,
  REDIS_CERT: env.redis.cert,
})
