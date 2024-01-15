import Redis from 'ioredis'
import { DataSource } from 'typeorm'
import { stringToHash } from '../../utils/helpers'
import { RssSubscriptionGroup } from '../../utils/createTask'
import { Queue } from 'bullmq'
import { QUEUE_NAME } from '../../queue-processor'

export const refreshAllFeeds = async (
  db: DataSource,
  redis: Redis
): Promise<boolean> => {
  const subscriptionGroups = (await db.createEntityManager().query(
    `
    SELECT
      url,
      ARRAY_AGG(id) AS "subscriptionIds",
      ARRAY_AGG(user_id) AS "userIds",
      ARRAY_AGG(last_fetched_at) AS "fetchedDates",
      ARRAY_AGG(coalesce(scheduled_at, NOW())) AS "scheduledDates",
      ARRAY_AGG(last_fetched_checksum) AS checksums,
      ARRAY_AGG(fetch_content) AS "fetchContents",
      ARRAY_AGG(coalesce(folder, $3)) AS folders
    FROM
      omnivore.subscriptions
    WHERE
      type = $1
      AND status = $2
      AND (scheduled_at <= NOW() OR scheduled_at IS NULL)
    GROUP BY
      url
    `,
    ['RSS', 'ACTIVE', 'following']
  )) as RssSubscriptionGroup[]

  for (let group of subscriptionGroups) {
    let jobid = `refresh-feed_${stringToHash(group.url)}_${stringToHash(
      JSON.stringify(group.userIds.sort())
    )}`
    const payload = {
      subscriptionIds: group.subscriptionIds,
      feedUrl: group.url,
      lastFetchedTimestamps: group.fetchedDates.map(
        (timestamp) => timestamp?.getTime() || 0
      ), // unix timestamp in milliseconds
      lastFetchedChecksums: group.checksums,
      scheduledTimestamps: group.scheduledDates.map((timestamp) =>
        timestamp.getTime()
      ), // unix timestamp in milliseconds
      userIds: group.userIds,
      fetchContents: group.fetchContents,
      folders: group.folders,
    }

    await queueRSSRefreshFeedJob(redis, jobid, payload)
  }

  return true
}

const createBackendQueue = (redis: Redis): Queue | undefined => {
  return new Queue(QUEUE_NAME, {
    connection: redis,
  })
}

export const queueRSSRefreshAllFeedsJob = async (redis: Redis) => {
  const queue = createBackendQueue(redis)
  if (!queue) {
    return false
  }
  return queue.add('refresh-all-feeds', {})
}

export const queueRSSRefreshFeedJob = async (
  redis: Redis,
  jobid: string,
  payload: any
) => {
  const queue = createBackendQueue(redis)
  if (!queue) {
    return false
  }
  return queue.add('refresh-feed', payload, {
    jobId: jobid,
    removeOnComplete: true,
    removeOnFail: true,
  })
}
