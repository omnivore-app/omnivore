import Redis, { RedisOptions } from 'ioredis'
import 'dotenv/config'

export type RedisDataSourceOptions = {
  REDIS_URL?: string
  REDIS_CERT?: string
}

export class RedisDataSource {
  options: RedisDataSourceOptions

  cacheClient: Redis
  queueRedisClient: Redis

  constructor(options: RedisDataSourceOptions) {
    this.options = options

    this.cacheClient = createRedisClient('cache', this.options)
    this.queueRedisClient = createRedisClient('queue', this.options)
  }

  setOptions(options: RedisDataSourceOptions): void {
    this.options = options
  }

  async shutdown(): Promise<void> {
    try {
      await this.queueRedisClient?.quit()
      await this.cacheClient?.quit()
    } catch (err) {
      console.error('error while shutting down redis', err)
    }
  }
}

const createRedisClient = (name: string, options: RedisDataSourceOptions) => {
  const redisURL = options.REDIS_URL
  const cert = options.REDIS_CERT?.replace(/\\n/g, '\n') // replace \n with new line
  if (!redisURL) {
    throw 'Error: no redisURL supplied'
  }

  const redisOptions: RedisOptions = {
    name,
    connectTimeout: 10000, // 10 seconds
    tls: cert
      ? {
          cert,
          rejectUnauthorized: false, // for self-signed certs
        }
      : undefined,
    maxRetriesPerRequest: null,
    offlineQueue: false,
  }

  const redis = new Redis(redisURL, redisOptions)

  redis.on('connect', () => {
    console.log('Redis connected', name)
  })

  redis.on('error', (err) => {
    console.error('Redis error', err, name)
  })

  redis.on('close', () => {
    console.log('Redis closed', name)
  })

  return redis
}

export const redisDataSource = new RedisDataSource({
  REDIS_URL: process.env.REDIS_URL,
  REDIS_CERT: process.env.REDIS_CERT,
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on('SIGINT', async () => {
  console.log('SIGINT signal received.')

  try {
    await redisDataSource.shutdown()
  } catch (error) {
    console.error('error while shutting down redis', error)
  }

  process.exit(0)
})
