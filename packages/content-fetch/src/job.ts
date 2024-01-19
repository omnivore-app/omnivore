import { BulkJobOptions, Queue } from 'bullmq'
import { redis } from './redis'

const QUEUE_NAME = 'omnivore-backend-queue'
const JOB_NAME = 'save-page'

interface savePageJob {
  url: string
  userId: string
  data: unknown
  isRss: boolean
  isImport: boolean
}

const queue = new Queue(QUEUE_NAME, {
  connection: redis,
})

const getPriority = (job: savePageJob): number => {
  // we want to prioritized jobs by the expected time to complete
  // lower number means higher priority
  // priority 1: jobs that are expected to finish immediately
  // priority 5: jobs that are expected to finish in less than 10 second
  // priority 10: jobs that are expected to finish in less than 10 minutes
  // priority 100: jobs that are expected to finish in less than 1 hour
  if (job.isRss) {
    return 10
  }
  if (job.isImport) {
    return 100
  }

  return 5
}

const getAttempts = (job: savePageJob): number => {
  if (job.isRss || job.isImport) {
    // we don't want to retry rss or import jobs
    return 1
  }

  return 2
}

const getOpts = (job: savePageJob): BulkJobOptions => {
  return {
    // jobId: `${job.userId}-${job.url}`,
    // removeOnComplete: true,
    // removeOnFail: true,
    attempts: getAttempts(job),
    priority: getPriority(job),
  }
}

export const queueSavePageJob = async (savePageJobs: savePageJob[]) => {
  const jobs = savePageJobs.map((job) => ({
    name: JOB_NAME,
    data: job.data,
    opts: getOpts(job),
  }))

  return queue.addBulk(jobs)
}
