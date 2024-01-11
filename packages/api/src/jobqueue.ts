import { env } from './env'

import { Queue } from 'bullmq'
import Redis from 'ioredis'

const redisOptions = () => {
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

export const rssRefreshFeedJobQueue = new Queue('rssRefreshFeed', {
  connection,
})

export const addRefreshFeedJob = async (jobid: string, payload: any) => {
  return rssRefreshFeedJobQueue.add('rssRefreshFeed', payload, {
    jobId: jobid,
    removeOnComplete: true,
    removeOnFail: true,
  })
}
