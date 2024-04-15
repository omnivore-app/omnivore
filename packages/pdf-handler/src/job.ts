import { Queue } from 'bullmq'
import { redisDataSource } from './redis_data_source'

const QUEUE_NAME = 'omnivore-backend-queue'
const JOB_NAME = 'update-pdf-content'

const queue = new Queue(QUEUE_NAME, {
  connection: redisDataSource.queueRedisClient,
})

export type State = 'SUCCEEDED' | 'FAILED'

type UpdatePageJobData = {
  fileId: string
  content?: string
  title?: string
  author?: string
  description?: string
  state?: State
}

export const queueUpdatePageJob = async (data: UpdatePageJobData) => {
  return queue.add(JOB_NAME, data, {
    priority: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  })
}
