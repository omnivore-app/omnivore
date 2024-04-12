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

  // do something
  await Promise.resolve()
}
