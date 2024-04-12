import { setDigest } from '../services/digest'
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

  // TODO: create digest
  const digest = {
    url: 'https://example.com',
    title: 'Example Digest',
    jobState: 'completed',
    content: 'This is an example digest',
    chapters: [
      {
        title: 'Chapter 1',
      },
      {
        title: 'Chapter 2',
      },
    ],
    urlsToAudio: ['https://example.com/audio'],
  }

  // save digest to redis
  await setDigest(data.userId, digest)

  logger.info('digest created', digest)

  return true
}
