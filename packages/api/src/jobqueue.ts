import { env } from './env'

import { Queue, RedisOptions } from 'bullmq'
import Redis from 'ioredis'

const createRSSRefreshFeedQueue = (): Queue | undefined => {
  if (!env.redis.url) {
    return undefined
  }
  const redisOptions = (): RedisOptions => {
    if (env.redis.url?.startsWith('rediss://') && env.redis.cert) {
      return {
        tls: {
          cert: env.redis.cert?.replace(/\\n/g, '\n'),
          rejectUnauthorized: false,
        },
        maxRetriesPerRequest: null,
      }
    }
    return {
      maxRetriesPerRequest: null,
    }
  }

  const connection = new Redis(env.redis.url ?? '', redisOptions())
  return new Queue('rssRefreshFeed', { connection })
}

export const addRefreshFeedJob = async (jobid: string, payload: any) => {
  const rssRefreshFeedJobQueue = createRSSRefreshFeedQueue()

  if (!rssRefreshFeedJobQueue) {
    return false
  }
  return rssRefreshFeedJobQueue?.add('rssRefreshFeed', payload, {
    jobId: jobid,
    removeOnComplete: true,
    removeOnFail: true,
  })
}
