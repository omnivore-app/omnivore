import { Queue } from 'bullmq'
import Redis from 'ioredis'

export const QUEUE = 'omnivore-backend-queue'

export const getQueue = async (
  connection: Redis,
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
