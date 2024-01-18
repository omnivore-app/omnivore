import { Queue } from 'bullmq'
import { redis } from './redis'

const QUEUE_NAME = 'omnivore-content-fetch'

interface savePageJob {
  url: string
  userId: string
  data: unknown
}

const createQueue = (): Queue | undefined => {
  return new Queue(QUEUE_NAME, {
    connection: redis,
  })
}

export const queueSavePageJob = async (savePageJobs: savePageJob[]) => {
  const queue = createQueue()
  if (!queue) {
    return undefined
  }

  const jobs = savePageJobs.map((job) => ({
    name: 'save-page',
    data: job.data,
    opts: {
      jobId: `${job.userId}-${job.url}`,
      removeOnComplete: true,
      removeOnFail: true,
    },
  }))

  return queue.addBulk(jobs)
}
