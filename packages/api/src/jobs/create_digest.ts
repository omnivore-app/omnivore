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
    url: '',
    title: '',
    content: '<readable html>',
    chapters: [
      { title: '00:30 - China buying' },
      { title: '10:20 - Twitter for sale' },
    ],
    urlsToAudio: [
      'https://storage.google.com/...',
      'https://api.omnivore.app/api/digest/audio/<id>',
    ],
  }

  // save digest to redis
  await setDigest(data.userId, digest)

  logger.info('digest created', digest)

  return true
}
