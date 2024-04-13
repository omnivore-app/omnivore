import { redisDataSource } from '../redis_data_source'

export const CREATE_DIGEST_JOB = 'create-digest'

export interface CreateDigestJobData {
  userId: string
}

export interface CreateDigestJobResponse {
  jobId: string
}

export interface Digest {
  url?: string
  title?: string
  content?: string
  chapters?: Chapter[]
  urlsToAudio?: string[]
  jobState: string
}

interface Chapter {
  title: string
}

const digestKey = (userId: string) => `digest:${userId}`

export const getDigest = async (userId: string): Promise<Digest | null> => {
  const digest = await redisDataSource.redisClient?.get(digestKey(userId))
  return digest ? (JSON.parse(digest) as Digest) : null
}
