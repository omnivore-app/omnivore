import { RedisDataSource } from '@omnivore/utils'
import { Job, Queue, QueueEvents, RedisClient, Worker } from 'bullmq'
import { JobData, processFetchContentJob } from './request_handler'

export const QUEUE = 'omnivore-content-fetch-queue'

export const getQueue = async (
  connection: RedisClient,
  queueName = QUEUE
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

export const createWorker = (
  redisDataSource: RedisDataSource,
  queueName = QUEUE
) => {
  const worker = new Worker(
    queueName,
    async (job: Job<JobData>) => {
      // process the job
      await processFetchContentJob(redisDataSource, job.data, job.attemptsMade)
    },
    {
      connection: redisDataSource.queueRedisClient,
      autorun: true, // start processing jobs immediately
      // process up to 10 jobs in a second
      limiter: {
        max: 10,
        duration: 1000,
      },
      concurrency: 2, // process up to 2 jobs concurrently
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
