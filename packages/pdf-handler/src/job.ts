import { Queue } from 'bullmq'
import { redisDataSource } from './redis_data_source'

const QUEUE_NAME = 'omnivore-backend-queue'
const JOB_NAME = 'update-pdf-content'

interface savePageJob {
  userId: string
  data: unknown
  isRss: boolean
  isImport: boolean
}

const queue = new Queue(QUEUE_NAME, {
  connection: redisDataSource.queueRedisClient,
})

type UpdatePageJobData = {
  fileId: string
  content: string
  title?: string
  author?: string
  description?: string
}

export const queueUpdatePageJob = async (data: UpdatePageJobData) => {
  return queue.add(JOB_NAME, data)
}
