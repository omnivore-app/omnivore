import { RedisDataSource } from '@omnivore/utils'
import { Job, Queue, RedisClient, Worker } from 'bullmq'
import { JobData, markFetchFailure, processFetchContentJob } from './request_handler'

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
        age: 3600, // keep up to 1 hour
      },
      removeOnFail: {
        age: 24 * 3600, // keep up to 1 day
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
      const maxAttempts = job.opts.attempts ?? 1
      try {
        // process the job
        await processFetchContentJob(redisDataSource, job.data, job.attemptsMade)
      } catch (e) {
        const lastAttempt = job.attemptsMade + 1 >= maxAttempts
        if (lastAttempt) {
          const errorMessage = e instanceof Error ? e.message : 'unknown error'
          let users = job.data.users || []
          if (job.data.userId) {
            // Back-compat payload path
            users = [
              {
                id: job.data.userId,
                folder: job.data.folder,
                libraryItemId: job.data.saveRequestId || '',
              },
            ].filter((u) => u.libraryItemId)
          }
          if (users.length) {
            await markFetchFailure(users, errorMessage)
          }
        }
        throw e
      }
    },
    {
      connection: redisDataSource.queueRedisClient,
      autorun: true, // start processing jobs immediately
      // process up to 20 jobs in a second
      limiter: {
        max: 20,
        duration: 1000,
      },
      concurrency: 4, // process up to 4 jobs concurrently
    }
  )

  worker.on('error', (err) => {
    console.error('worker error:', err)
  })

  return worker
}
