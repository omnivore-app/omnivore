import { RedisDataSource } from '@omnivore/utils'
import { Job, JobType, Queue, QueueEvents, RedisClient, Worker } from 'bullmq'
import express, { Express } from 'express'
import asyncHandler from 'express-async-handler'
import { JobData, processFetchContentJob } from './request_handler'

const QUEUE_NAME = 'omnivore-content-fetch-queue'

export const getContentFetchQueue = async (
  connection: RedisClient
): Promise<Queue> => {
  const queue = new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      backoff: {
        type: 'exponential',
        delay: 2000, // 2 seconds
      },
      removeOnComplete: {
        age: 24 * 3600, // keep up to 24 hours
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
      },
    },
  })
  await queue.waitUntilReady()
  return queue
}

const createWorker = (redisDataSource: RedisDataSource) => {
  return new Worker(
    QUEUE_NAME,
    async (job: Job<JobData>) => {
      // process the job
      await processFetchContentJob(redisDataSource, job.data)
    },
    {
      connection: redisDataSource.queueRedisClient,
      autorun: true, // start processing jobs immediately
      limiter: {
        max: 50,
        duration: 1000, // 1 second
      },
    }
  )
}

const main = () => {
  console.log('[worker]: starting worker')

  const app: Express = express()
  const port = process.env.PORT || 3002

  // create redis source
  const redisDataSource = new RedisDataSource({
    cache: {
      url: process.env.REDIS_URL,
      cert: process.env.REDIS_CERT,
    },
    mq: {
      url: process.env.MQ_REDIS_URL,
      cert: process.env.MQ_REDIS_CERT,
    },
  })

  // respond healthy to auto-scaler.
  app.get('/_ah/health', (req, res) => res.sendStatus(200))

  app.get(
    '/lifecycle/prestop',
    asyncHandler(async (_req, res) => {
      console.log('prestop lifecycle hook called.')
      await worker.close()
      res.sendStatus(200)
    })
  )

  app.get(
    '/metrics',
    asyncHandler(async (_, res) => {
      const queue = await getContentFetchQueue(redisDataSource.queueRedisClient)
      if (!queue) {
        res.sendStatus(400)
        return
      }

      let output = ''
      const jobsTypes: JobType[] = [
        'active',
        'failed',
        'completed',
        'prioritized',
      ]
      const counts = await queue.getJobCounts(...jobsTypes)

      jobsTypes.forEach((metric) => {
        output += `# TYPE omnivore_queue_messages_${metric} gauge\n`
        output += `omnivore_queue_messages_${metric}{queue="${QUEUE_NAME}"} ${counts[metric]}\n`
      })

      // Export the age of the oldest prioritized job in the queue
      const oldestJobs = await queue.getJobs(['prioritized'], 0, 1, true)
      if (oldestJobs.length > 0) {
        const currentTime = Date.now()
        const ageInSeconds = (currentTime - oldestJobs[0].timestamp) / 1000
        output += `# TYPE omnivore_queue_messages_oldest_job_age_seconds gauge\n`
        output += `omnivore_queue_messages_oldest_job_age_seconds{queue="${QUEUE_NAME}"} ${ageInSeconds}\n`
      } else {
        output += `# TYPE omnivore_queue_messages_oldest_job_age_seconds gauge\n`
        output += `omnivore_queue_messages_oldest_job_age_seconds{queue="${QUEUE_NAME}"} ${0}\n`
      }

      res.status(200).setHeader('Content-Type', 'text/plain').send(output)
    })
  )

  const server = app.listen(port, () => {
    console.log(`[worker]: started`)
  })

  const worker = createWorker(redisDataSource)

  const queueEvents = new QueueEvents(QUEUE_NAME, {
    connection: redisDataSource.queueRedisClient,
  })

  queueEvents.on('added', (job) => {
    console.log('added job: ', job.jobId, job.name)
  })

  queueEvents.on('removed', (job) => {
    console.log('removed job: ', job.jobId)
  })

  queueEvents.on('completed', (job) => {
    console.log('completed job: ', job.jobId)
  })

  queueEvents.on('failed', (job) => {
    console.log('failed job: ', job.jobId)
  })

  const gracefulShutdown = async (signal: string) => {
    console.log(`[worker]: Received ${signal}, closing server...`)
    await new Promise<void>((resolve) => {
      server.close((err) => {
        console.log('[worker]: Express server closed')
        if (err) {
          console.log('[worker]: error stopping server', { err })
        }

        resolve()
      })
    })

    await worker.close()
    console.log('[worker]: Worker closed')

    await redisDataSource.shutdown()
    console.log('[worker]: Redis connection closed')

    process.exit(0)
  }

  const handleShutdown = (signal: string) => {
    return () => {
      void gracefulShutdown(signal)
    }
  }

  process.on('SIGTERM', handleShutdown('SIGTERM'))
  process.on('SIGINT', handleShutdown('SIGINT'))

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    handleShutdown('uncaughtException')
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    handleShutdown('unhandledRejection')
  })
}

// only call main if the file was called from the CLI and wasn't required from another module
if (require.main === module) {
  main()
}
