import Redis, { RedisOptions } from 'ioredis'
import { env } from './env'
import { logger } from './utils/logger'

type RedisClientType = 'cache' | 'mq'
type RedisDataSourceOption = {
  url?: string
  cert?: string
}
export type RedisDataSourceOptions = {
  [key in RedisClientType]: RedisDataSourceOption
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

    this.redisClient = createIORedisClient('cache', this.options)
    this.workerRedisClient =
      createIORedisClient('mq', this.options) || this.redisClient // if mq is not defined, use cache
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
      logger.error('error while shutting down redis', err)
    }
  }
}

const createIORedisClient = (
  name: RedisClientType,
  options: RedisDataSourceOptions
): Redis | undefined => {
  const option = options[name]
  const redisURL = option.url
  if (!redisURL) {
    logger.info(`no redisURL supplied: ${name}`)
    return undefined
  }

  const redisCert = option.cert
  const tls =
    redisURL.startsWith('rediss://') && redisCert
      ? {
          ca: redisCert,
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

export const redisDataSource = new RedisDataSource(
  env.redis as RedisDataSourceOptions
)
