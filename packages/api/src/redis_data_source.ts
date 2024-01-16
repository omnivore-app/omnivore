import Redis, { RedisOptions } from 'ioredis'
import { env } from './env'

export type RedisDataSourceOptions = {
  REDIS_URL?: string
  REDIS_CERT?: string
}

export class RedisDataSource {
  options: RedisDataSourceOptions
  isInitialized: Boolean

  redisClient: Redis | undefined = undefined
  workerRedisClient: Redis | undefined = undefined

  constructor(options: RedisDataSourceOptions) {
    this.options = options
    this.isInitialized = false
  }

  async initialize(): Promise<this> {
    if (this.isInitialized) throw 'Error already initialized'

    this.redisClient = createIORedisClient(this.options)
    this.workerRedisClient = createIORedisClient(this.options)
    this.isInitialized = true

    this.redisClient?.connect()

    return this
  }

  setOptions(options: RedisDataSourceOptions): void {
    this.options = options
  }

  async shutdown(): Promise<void> {
    if (this.redisClient && this.redisClient.status == 'ready') {
      this.redisClient.quit()
    }
    if (this.workerRedisClient && this.workerRedisClient.status == 'ready') {
      this.workerRedisClient.quit()
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
  const tls =
    redisURL.startsWith('rediss://') && options.REDIS_CERT
      ? {
          ca: options.REDIS_CERT,
          rejectUnauthorized: false,
        }
      : undefined

  const redisOptions = {
    tls,
    connectTimeout: 10000,
    maxRetriesPerRequest: null,
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
  console.log('connecting to redis: ', { redisURL, redisOptions })
  return new Redis(redisURL, redisOptions)
}

export const redisDataSource = new RedisDataSource({
  REDIS_URL: env.redis.url,
  REDIS_CERT: env.redis.cert,
})
