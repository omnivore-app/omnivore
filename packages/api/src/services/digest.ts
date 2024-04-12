import { redisDataSource } from '../redis_data_source'

export interface Digest {
  url: string
  title: string
  jobState: string
  content: string
  chapters: Chapter[]
  urlsToAudio: string[]
}

interface Chapter {
  title: string
}

const digestKey = (userId: string) => `digest:${userId}`

export const getDigest = async (userId: string): Promise<Digest | null> => {
  const digest = await redisDataSource.redisClient?.get(digestKey(userId))
  return digest ? (JSON.parse(digest) as Digest) : null
}

export const setDigest = async (userId: string, digest: Digest) => {
  const result = await redisDataSource.redisClient?.set(
    digestKey(userId),
    JSON.stringify(digest)
  )

  if (result != 'OK') {
    throw new Error('Failed to set digest')
  }
}
