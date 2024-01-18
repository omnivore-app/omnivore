import { Job, Queue } from 'bullmq'
import { DataSource } from 'typeorm'
import { QUEUE_NAME } from '../../queue-processor'
import { redisDataSource } from '../../redis_data_source'
import { RssSubscriptionGroup } from '../../utils/createTask'
import { stringToHash } from '../../utils/helpers'

export const refreshAllFeeds = async (db: DataSource): Promise<boolean> => {
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

  for (const group of subscriptionGroups) {
    try {
      await updateSubscriptionGroup(group)
    } catch (err) {
      // we don't want to fail the whole job if one subscription group fails
      console.error('error updating subscription group')
    }
  }

  return true
}

const updateSubscriptionGroup = async (group: RssSubscriptionGroup) => {
  const feedURL = group.url
  const userList = JSON.stringify(group.userIds.sort())
  if (!feedURL) {
    console.error('no url for feed group', group)
    return
  }
  if (!userList) {
    console.error('no userlist for feed group', group)
    return
  }
  const jobid = `refresh-feed_${stringToHash(feedURL)}_${stringToHash(
    userList
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

  await queueRSSRefreshFeedJob(jobid, payload)
}

const createBackendQueue = (): Queue | undefined => {
  if (!redisDataSource.workerRedisClient) {
    throw new Error('Can not create queues, redis is not initialized')
  }
  return new Queue(QUEUE_NAME, {
    connection: redisDataSource.workerRedisClient,
  })
}

export const queueRSSRefreshAllFeedsJob = async () => {
  const queue = createBackendQueue()
  if (!queue) {
    return false
  }
  return queue.add('refresh-all-feeds', {})
}

type QueuePriority = 'low' | 'high'

export const queueRSSRefreshFeedJob = async (
  jobid: string,
  payload: any,
  options = { priority: 'high' as QueuePriority }
): Promise<Job | undefined> => {
  const queue = createBackendQueue()
  if (!queue) {
    return undefined
  }
  return queue.add('refresh-feed', payload, {
    jobId: jobid,
    removeOnComplete: true,
    removeOnFail: true,
    lifo: options.priority == 'high',
  })
}
