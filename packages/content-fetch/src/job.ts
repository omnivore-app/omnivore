import { RedisDataSource } from '@omnivore/utils'
import { BulkJobOptions, Queue } from 'bullmq'

const QUEUE_NAME = 'omnivore-backend-queue'
const JOB_NAME = 'save-page'

interface SavePageJobData {
  userId: string
  url: string
  finalUrl: string
  articleSavingRequestId: string

  state?: string
  labels?: string[]
  source: string
  folder?: string
  rssFeedUrl?: string
  savedAt?: string
  publishedAt?: string
  taskId?: string
  title?: string
  contentType?: string
  cacheKey?: string
}

interface SavePageJob {
  userId: string
  data: SavePageJobData
  isRss: boolean
  isImport: boolean
  priority: 'low' | 'high'
}

const getPriority = (job: SavePageJob): number => {
  // we want to prioritized jobs by the expected time to complete
  // lower number means higher priority
  // priority 1: jobs that are expected to finish immediately
  // priority 5: jobs that are expected to finish in less than 10 second
  // priority 10: jobs that are expected to finish in less than 10 minutes
  // priority 100: jobs that are expected to finish in less than 1 hour
  if (job.isImport) {
    return 100
  }

  if (job.isRss) {
    return job.priority === 'low' ? 10 : 5
  }

  return job.priority === 'low' ? 5 : 1
}

const getAttempts = (job: SavePageJob): number => {
  if (job.isImport) {
    // we don't want to retry import jobs
    return 1
  }

  return job.isRss ? 2 : 3
}

const getOpts = (job: SavePageJob): BulkJobOptions => {
  return {
    attempts: getAttempts(job),
    priority: getPriority(job),
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  }
}

export const queueSavePageJob = async (
  redisDataSource: RedisDataSource,
  savePageJobs: SavePageJob[]
) => {
  const jobs = savePageJobs.map((job) => ({
    name: JOB_NAME,
    data: job.data,
    opts: getOpts(job),
  }))
  console.log(
    'queue save page jobs:',
    jobs.map((job) => job.data.finalUrl)
  )

  const queue = new Queue(QUEUE_NAME, {
    connection: redisDataSource.queueRedisClient,
  })

  return queue.addBulk(jobs)
}
