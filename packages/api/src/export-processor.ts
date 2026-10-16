/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  ConnectionOptions,
  Job,
  Worker,
} from 'bullmq'
import express, { Express } from 'express'
import { appDataSource } from './data_source'
import { env } from './env'
import { exportJob, EXPORT_JOB_NAME } from './jobs/export'
import { redisDataSource } from './redis_data_source'
import { logger } from './utils/logger'

export const EXPORT_QUEUE_NAME =
  process.env['EXPORT_QUEUE_NAME'] ?? 'omnivore-export-queue'

export const createWorker = (connection: ConnectionOptions) =>
  new Worker(
    EXPORT_QUEUE_NAME,
    async (job: Job) => {
      const executeJob = async (job: Job) => {
        switch (job.name) {
          case EXPORT_JOB_NAME:
            return exportJob(job.data)
          default:
            logger.warning(`[export-processor] unhandled job: ${job.name}`)
        }
      }

      await executeJob(job)
    },
    {
      connection,
      autorun: true, // start processing jobs immediately
      lockDuration: 60_000, // 1 minute
      concurrency: 2,
    }
  )

const main = async () => {
  console.log('[export-processor]: starting export queue processor')

  const app: Express = express()
  const port = process.env.PORT || 3003

  redisDataSource.setOptions({
    cache: env.redis.cache,
    mq: env.redis.mq,
  })

  // respond healthy to auto-scaler.
  app.get('/_ah/health', (req, res) => res.sendStatus(200))

  app.get('/lifecycle/prestop', async (req, res) => {
    logger.info('prestop lifecycle hook called.')
    await worker.close()
    res.sendStatus(200)
  })

  const server = app.listen(port, () => {
    console.log(`[export-processor]: started`)
  })

  // This is done after all the setup so it can access the
  // environment that was loaded from GCP
  await appDataSource.initialize()
  await redisDataSource.initialize()

  const redisClient = redisDataSource.redisClient
  const workerRedisClient = redisDataSource.workerRedisClient
  if (!workerRedisClient || !redisClient) {
    throw '[export-processor] error redis is not initialized'
  }

  const worker = createWorker(workerRedisClient)

  workerRedisClient.on('error', (error) => {
    console.trace('[export-processor]: redis worker error', { error })
  })

  redisClient.on('error', (error) => {
    console.trace('[export-processor]: redis error', { error })
  })

  const gracefulShutdown = async (signal: string) => {
    console.log(`[export-processor]: Received ${signal}, closing server...`)
    await new Promise<void>((resolve) => {
      server.close((err) => {
        console.log('[export-processor]: Express server closed')
        if (err) {
          console.log('[export-processor]: error stopping server', { err })
        }

        resolve()
      })
    })
    await worker.close()
    console.log('[export-processor]: Worker closed')

    await redisDataSource.shutdown()
    console.log('[export-processor]: Redis connection closed')

    await appDataSource.destroy()
    console.log('[export-processor]: DB connection closed')

    process.exit(0)
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

  process.on('uncaughtException', function (err) {
    // Handle the error safely
    logger.error('Uncaught exception', err)
  })

  process.on('unhandledRejection', (reason, promise) => {
    // Handle the error safely
    logger.error('Unhandled Rejection at: Promise', { promise, reason })
  })
}

// only call main if the file was called from the CLI and wasn't required from another module
if (require.main === module) {
  main().catch((e) => console.error(e))
}
