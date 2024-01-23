/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Job, QueueEvents, Worker, Queue } from 'bullmq'
import express, { Express } from 'express'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { appDataSource } from './data_source'
import { env } from './env'
import { refreshAllFeeds } from './jobs/rss/refreshAllFeeds'
import { refreshFeed } from './jobs/rss/refreshFeed'
import { savePageJob } from './jobs/save_page'
import { redisDataSource } from './redis_data_source'
import { CustomTypeOrmLogger } from './utils/logger'
import { updatePDFContentJob } from './jobs/update_pdf_content'

export const QUEUE_NAME = 'omnivore-backend-queue'

let backendQueue: Queue | undefined
export const getBackendQueue = async (): Promise<Queue | undefined> => {
  if (backendQueue) {
    await backendQueue.waitUntilReady()
    return backendQueue
  }
  if (!redisDataSource.workerRedisClient) {
    throw new Error('Can not create queues, redis is not initialized')
  }
  backendQueue = new Queue(QUEUE_NAME, {
    connection: redisDataSource.workerRedisClient,
  })
  await backendQueue.waitUntilReady()
  return backendQueue
}

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

  const queue = new Queue(QUEUE_NAME, {
    connection: workerRedisClient,
  })

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      switch (job.name) {
        case 'refresh-all-feeds': {
          const counts = await queue.getJobCounts('wait')
          if (counts.wait > 1000) {
            return
          }
          return await refreshAllFeeds(appDataSource)
        }
        case 'refresh-feed': {
          return await refreshFeed(job.data)
        }
        case 'save-page': {
          return savePageJob(job.data, job.attemptsMade)
        }
        case 'update-pdf-content': {
          return updatePDFContentJob(job.data)
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
    console.log('added job: ', job.jobId, job.name)
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
    await worker.close()
    await redisDataSource.shutdown()
    process.exit(0)
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
}

// only call main if the file was called from the CLI and wasn't required from another module
if (require.main === module) {
  main().catch((e) => console.error(e))
}
