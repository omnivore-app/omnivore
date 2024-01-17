/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Express } from 'express'
import { appDataSource } from './data_source'
import { getEnv } from './util'
import { redisDataSource } from './redis_data_source'
import { CustomTypeOrmLogger } from './utils/logger'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { refreshAllFeeds } from './jobs/rss/refreshAllFeeds'
import { Job, Worker, QueueEvents } from 'bullmq'
import { refreshFeed } from './jobs/rss/refreshFeed'
import { env } from './env'

export const QUEUE_NAME = 'omnivore-backend-queue'

const main = async () => {
  console.log('[queue-processor]: starting queue processor')

  const app: Express = express()
  const port = process.env.PORT || 3002

  redisDataSource.setOptions({
    REDIS_URL: env.redis.url,
    REDIS_CERT: env.redis.cert,
  })

  appDataSource.setOptions({
    type: 'postgres',
    host: env.pg.host,
    port: env.pg.port,
    schema: 'omnivore',
    username: env.pg.userName,
    password: env.pg.password,
    database: env.pg.dbName,
    logging: ['query', 'info'],
    entities: [__dirname + '/entity/**/*{.js,.ts}'],
    subscribers: [__dirname + '/events/**/*{.js,.ts}'],
    namingStrategy: new SnakeNamingStrategy(),
    logger: new CustomTypeOrmLogger(['query', 'info']),
    connectTimeoutMS: 40000, // 40 seconds
    maxQueryExecutionTime: 10000, // 10 seconds
  })

  // respond healthy to auto-scaler.
  app.get('/_ah/health', (req, res) => res.sendStatus(200))

  const server = app.listen(port, () => {
    console.log(`[queue-processor]: started`)
  })

  // This is done after all the setup so it can access the
  // environment that was loaded from GCP
  await appDataSource.initialize()
  await redisDataSource.initialize()

  const redisClient = redisDataSource.redisClient
  const workerRedisClient = redisDataSource.workerRedisClient
  if (!workerRedisClient || !redisClient) {
    throw '[queue-processor] error redis is not initialized'
  }

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      switch (job.name) {
        case 'refresh-all-feeds': {
          return await refreshAllFeeds(appDataSource)
        }
        case 'refresh-feed': {
          return await refreshFeed(job.data)
        }
      }
      return true
    },
    {
      connection: workerRedisClient,
    }
  )

  const queueEvents = new QueueEvents(QUEUE_NAME, {
    connection: workerRedisClient,
  })

  queueEvents.on('added', async (job) => {
    console.log('added job: ', job.jobId)
  })

  queueEvents.on('removed', async (job) => {
    console.log('removed job: ', job.jobId)
  })

  queueEvents.on('completed', async (job) => {
    console.log('completed job: ', job.jobId)
  })

  workerRedisClient.on('error', (error) => {
    console.trace('[queue-processor]: redis worker error', { error })
  })

  redisClient.on('error', (error) => {
    console.trace('[queue-processor]: redis error', { error })
  })

  const gracefulShutdown = async (signal: string) => {
    console.log(`[queue-processor]: Received ${signal}, closing server...`)
    server.close(async () => {
      console.log(
        '[queue-processor]: Server closed. shuting down and exiting process...'
      )
      await worker.close()
      await redisDataSource.shutdown()
      process.exit(0)
    })
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
}

// only call main if the file was called from the CLI and wasn't required from another module
if (require.main === module) {
  main().catch((e) => console.error(e))
}
