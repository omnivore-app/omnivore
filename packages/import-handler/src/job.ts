import { RedisDataSource } from '@omnivore/utils'
import { Queue } from 'bullmq'
import { ArticleSavingRequestStatus } from '.'

const BACKEND_QUEUE = 'omnivore-backend-queue'
const CONTENT_FETCH_QUEUE = 'omnivore-content-fetch-queue'

export const SEND_EMAIL_JOB = 'send-email'
const FETCH_CONTENT_JOB = 'fetch-content'

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

  const job = await queue.add(FETCH_CONTENT_JOB, data, {
    priority: 100,
    attempts: 1,
  })

  if (!job || !job.id) {
    console.error('Error while enqueuing fetch-content job', data)
    throw new Error('Error while enqueuing fetch-content job')
  }

  return job.id
}
