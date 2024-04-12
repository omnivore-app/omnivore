import { logger } from '../utils/logger'

export const CREATE_DIGEST_JOB = 'create-digest'

export interface CreateDigestJobData {
  userId: string
}

export interface CreateDigestJobResponse {
  jobId: string
}

export const processCreateDigestJob = async (data: CreateDigestJobData) => {
  logger.info('processing create digest job', data)

  // simulate long running task
  await new Promise((resolve) => setTimeout(resolve, 5000))

  logger.info('digest created')

  return true
}
