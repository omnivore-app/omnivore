import { RedisDataSource } from '@omnivore/utils'
import { Job, Queue, QueueEvents, RedisClient, Worker } from 'bullmq'
import { JobData, processFetchContentJob } from './request_handler'

const FAST_QUEUE = 'omnivore-content-fetch-queue'
const SLOW_QUEUE = 'omnivore-content-fetch-slow-queue'
const RSS_QUEUE = 'omnivore-content-fetch-rss-queue'
const QUEUE_NAMES = [FAST_QUEUE, SLOW_QUEUE, RSS_QUEUE] as const

export const getQueue = async (
  connection: RedisClient,
  queueName: string
): Promise<Queue> => {
  const queue = new Queue(queueName, {
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

const createWorker = (redisDataSource: RedisDataSource, queueName: string) => {
  const getLimiter = (queueName: string) => {
    switch (queueName) {
      case SLOW_QUEUE:
        return {
          max: 5,
          duration: 1000, // 1 second
        }
      case RSS_QUEUE:
        return {
          max: 3,
          duration: 1000, // 1 second
        }
      default:
        return {
          max: 10,
          duration: 1000, // 1 second
        }
    }
  }

  const worker = new Worker(
    queueName,
    async (job: Job<JobData>) => {
      // process the job
      await processFetchContentJob(redisDataSource, job.data)
    },
    {
      connection: redisDataSource.queueRedisClient,
      autorun: true, // start processing jobs immediately
      limiter: getLimiter(queueName),
    }
  )

  worker.on('error', (err) => {
    console.error('worker error:', err)
  })

  const queueEvents = new QueueEvents(queueName, {
    connection: redisDataSource.queueRedisClient,
  })

  queueEvents.on('added', (job) => {
    console.log('added job:', job.jobId, job.name)
  })

  queueEvents.on('removed', (job) => {
    console.log('removed job:', job.jobId)
  })

  queueEvents.on('completed', (job) => {
    console.log('completed job:', job.jobId)
  })

  queueEvents.on('failed', (job) => {
    console.log('failed job:', job.jobId)
  })

  return worker
}

export const createWorkers = (redisDataSource: RedisDataSource) => {
  return QUEUE_NAMES.map((queueName) =>
    createWorker(redisDataSource, queueName)
  )
}
