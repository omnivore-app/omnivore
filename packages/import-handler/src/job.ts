import { RedisDataSource } from '@omnivore/utils'
import { Queue } from 'bullmq'
import { ArticleSavingRequestStatus } from '.'
import crypto from 'crypto'

const BACKEND_QUEUE = 'omnivore-backend-queue'
const CONTENT_FETCH_QUEUE = 'omnivore-content-fetch-queue'

export const SEND_EMAIL_JOB = 'send-email'
const FETCH_CONTENT_JOB = 'fetch-content'
const JOB_VERSION = 'v001'

interface SendEmailJobData {
  userId: string
  from?: string
  subject?: string
  html?: string
}

interface FetchContentJobData {
  url: string
  users: Array<{
    id: string
    folder?: string
    libraryItemId: string
  }>
  source: string
  taskId: string
  state?: ArticleSavingRequestStatus
  labels?: Array<{ name: string }>
  savedAt?: string
  publishedAt?: string
}

export const stringToHash = (str: string): string => {
  return crypto.createHash('md5').update(str).digest('hex')
}

export const queueEmailJob = async (
  redisDataSource: RedisDataSource,
  data: SendEmailJobData
) => {
  const queue = new Queue(BACKEND_QUEUE, {
    connection: redisDataSource.queueRedisClient,
  })

  await queue.add(SEND_EMAIL_JOB, data)
}

export const enqueueFetchContentJob = async (
  redisDataSource: RedisDataSource,
  data: FetchContentJobData
): Promise<string> => {
  const queue = new Queue(CONTENT_FETCH_QUEUE, {
    connection: redisDataSource.queueRedisClient,
  })

  // sort the data to make sure the hash is consistent
  const sortedData = JSON.stringify(data, Object.keys(data).sort())
  const jobId = `${FETCH_CONTENT_JOB}_${stringToHash(
    sortedData
  )}_${JOB_VERSION}`
  const job = await queue.add(FETCH_CONTENT_JOB, data, {
    jobId,
    removeOnComplete: true,
    removeOnFail: true,
    priority: 100,
    attempts: 1,
  })

  if (!job || !job.id) {
    console.error('Error while enqueuing fetch-content job', data)
    throw new Error('Error while enqueuing fetch-content job')
  }

  return job.id
}
