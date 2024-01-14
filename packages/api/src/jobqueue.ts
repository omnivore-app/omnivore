import { Queue } from 'bullmq'
import { mqRedisClient } from './redis'

const createRSSRefreshFeedQueue = (): Queue | undefined => {
  return new Queue('rssRefreshFeed', {
    connection: mqRedisClient,
  })
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
