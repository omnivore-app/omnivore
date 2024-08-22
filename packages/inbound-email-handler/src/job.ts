import { RedisDataSource } from '@omnivore/utils'
import { BulkJobOptions, Queue } from 'bullmq'

const QUEUE_NAME = 'omnivore-backend-queue'
export enum EmailJobType {
  ForwardEmail = 'forward-email',
  SaveNewsletter = 'save-newsletter',
  ConfirmationEmail = 'confirmation-email',
  SaveAttachment = 'save-attachment',
}

interface EmailJobData {
  from: string
  to: string
  subject: string
  html?: string
  text?: string
  headers?: Record<string, string | string[]>
  unsubMailTo?: string
  unsubHttpUrl?: string
  forwardedFrom?: string
  replyTo?: string
  uploadFile?: {
    fileName: string
    contentType: string
    id: string
  }
  confirmationCode?: string
}

const getPriority = (jobType: EmailJobType): number => {
  // we want to prioritized jobs by the expected time to complete
  // lower number means higher priority
  // priority 1: jobs that are expected to finish immediately
  // priority 5: jobs that are expected to finish in less than 10 second
  // priority 10: jobs that are expected to finish in less than 10 minutes
  // priority 100: jobs that are expected to finish in less than 1 hour
  switch (jobType) {
    case EmailJobType.ForwardEmail:
    case EmailJobType.ConfirmationEmail:
      return 1
    case EmailJobType.SaveAttachment:
    case EmailJobType.SaveNewsletter:
      return 5
    default:
      throw new Error(`unknown job type: ${jobType as string}`)
  }
}

const getOpts = (jobType: EmailJobType): BulkJobOptions => {
  return {
    attempts: 3,
    priority: getPriority(jobType),
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  }
}

export const queueEmailJob = async (
  redisDataSource: RedisDataSource,
  jobType: EmailJobType,
  data: EmailJobData
) => {
  const queue = new Queue(QUEUE_NAME, {
    connection: redisDataSource.queueRedisClient,
  })

  await queue.add(jobType, data, getOpts(jobType))
}
