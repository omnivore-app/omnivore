import { RedisDataSource } from '@omnivore/utils'
import {
  createPostgresBackend,
  Job,
  PostgresConnectionOptions,
  Queue,
  Worker,
} from 'bullmq'
import { JobData, processFetchContentJob } from './request_handler'
import Redis from 'ioredis'

export const QUEUE = 'omnivore-content-fetch-queue'

const queueFromConnectionOptions = (connection: Redis | PostgresConnectionOptions, queueName = QUEUE) => {
  if (typeof connection === 'string') {
    return new Queue(queueName, {
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
    }, createPostgresBackend)
  }

  return new Queue(
    queueName,
    {
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
    }
  )
}

export const getQueue = async (
  connection: Redis | PostgresConnectionOptions,
  queueName = QUEUE
) => {
  const queue = queueFromConnectionOptions(connection, queueName)
  await queue.waitUntilReady()
  return queue
}

export const createWorker = (
  dataSource: RedisDataSource | PostgresConnectionOptions,
  queueName = QUEUE
) => {
  const opts = {
    autorun: true, // start processing jobs immediately
    // process up to 20 jobs in a second
    limiter: {
      max: 20,
      duration: 1000,
    },
    concurrency: 4, // process up to 4 jobs concurrently
  }

  const workFn = (dataSource: RedisDataSource | undefined) => async (job: Job<JobData>) => {
        // process the job
        await processFetchContentJob(
          dataSource,
          job.data,
          job.attemptsMade
        )
    }

  if (typeof dataSource === 'string') {
    const worker = new Worker(
      queueName,
      workFn(undefined),
      {
        connection: dataSource as PostgresConnectionOptions,
        ...opts
      },
      createPostgresBackend
    )

    worker.on('error', (err) => {
      console.error('worker error:', err)
    })

    return worker
  }

  const worker = new Worker(queueName, workFn(dataSource as RedisDataSource), {
    connection: dataSource,
    ...opts,
  })

  worker.on('error', (err) => {
    console.error('worker error:', err)
  })

  return worker
}
