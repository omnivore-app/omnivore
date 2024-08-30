import { Job } from 'bullmq'
import { DataSource } from 'typeorm'
import { v4 as uuid } from 'uuid'
import { getQueue, JOB_VERSION } from '../../queue-processor'
import { validateUrl } from '../../services/create_page_save_request'
import { getJobPriority, RssSubscriptionGroup } from '../../utils/createTask'
import { stringToHash } from '../../utils/helpers'
import { logger } from '../../utils/logger'

export const REFRESH_ALL_FEEDS_JOB_NAME = 'refresh-all-feeds'
export const REFRESH_FEED_JOB_NAME = 'refresh-feed'

export type RSSRefreshContext = {
  type: 'all' | 'user-added'
  refreshID: string
  startedAt: string
}

export const refreshAllFeeds = async (db: DataSource): Promise<boolean> => {
  const refreshContext = {
    type: 'all',
    refreshID: uuid(),
    startedAt: new Date().toISOString(),
  } as RSSRefreshContext
  let subscriptionGroups = []

  const slaveQueryRunner = db.createQueryRunner('slave')
  try {
    subscriptionGroups = (await slaveQueryRunner.query(
      `
      SELECT
        url,
        ARRAY_AGG(s.id) AS "subscriptionIds",
        ARRAY_AGG(s.user_id) AS "userIds",
        ARRAY_AGG(s.most_recent_item_date) AS "mostRecentItemDates",
        ARRAY_AGG(coalesce(s.scheduled_at, NOW())) AS "scheduledDates",
        ARRAY_AGG(s.last_fetched_checksum) AS checksums,
        JSON_AGG(s.fetch_content_type) AS "fetchContentTypes",
        ARRAY_AGG(coalesce(s.folder, $3)) AS folders
      FROM
        omnivore.subscriptions s
      INNER JOIN
        omnivore.user u ON u.id = s.user_id AND u.status = $4
      WHERE
        s.type = $1
        AND s.status = $2
        AND (s.scheduled_at <= NOW() OR s.scheduled_at IS NULL)
      GROUP BY
        url
      `,
      ['RSS', 'ACTIVE', 'following', 'ACTIVE']
    )) as RssSubscriptionGroup[]
  } finally {
    await slaveQueryRunner.release()
  }

  logger.info(`rss: checking ${subscriptionGroups.length}`, {
    refreshContext,
  })

  for (const group of subscriptionGroups) {
    try {
      await updateSubscriptionGroup(group, refreshContext)
    } catch (err) {
      // we don't want to fail the whole job if one subscription group fails
      logger.error('error updating subscription group')
    }
  }
  const finishTime = new Date()
  logger.info(
    `rss: finished queuing subscription groups at ${finishTime.toISOString()}`,
    {
      refreshContext,
    }
  )

  return true
}

const updateSubscriptionGroup = async (
  group: RssSubscriptionGroup,
  refreshContext: RSSRefreshContext
) => {
  let feedURL = group.url
  const userIds = group.userIds
  // sort the user ids so that the job id is consistent
  // [...userIds] creates a shallow copy, so sort() does not mutate the original
  const userList = JSON.stringify([...userIds].sort())
  if (!feedURL) {
    logger.error('no url for feed group', group)
    return
  }
  if (!userList) {
    logger.error('no userlist for feed group', group)
    return
  }

  try {
    feedURL = validateUrl(feedURL).toString()
  } catch (err) {
    logger.error(`not refreshing invalid feed url: ${feedURL}`)
  }
  const jobid = `refresh-feed_${stringToHash(feedURL)}_${stringToHash(
    userList
  )}`
  const payload = {
    refreshContext,
    subscriptionIds: group.subscriptionIds,
    feedUrl: group.url,
    mostRecentItemDates: group.mostRecentItemDates.map(
      (timestamp) => timestamp?.getTime() || 0
    ), // unix timestamp in milliseconds
    lastFetchedChecksums: group.checksums,
    scheduledTimestamps: group.scheduledDates.map((timestamp) =>
      timestamp.getTime()
    ), // unix timestamp in milliseconds
    userIds,
    fetchContentTypes: group.fetchContentTypes,
    folders: group.folders,
  }

  await queueRSSRefreshFeedJob(jobid, payload)
}

export const queueRSSRefreshAllFeedsJob = async () => {
  const queue = await getQueue()
  if (!queue) {
    return false
  }
  return queue.add(
    REFRESH_ALL_FEEDS_JOB_NAME,
    {},
    {
      priority: getJobPriority(REFRESH_ALL_FEEDS_JOB_NAME),
    }
  )
}

type QueuePriority = 'low' | 'high'

export const queueRSSRefreshFeedJob = async (
  jobid: string,
  payload: any,
  options = { priority: 'low' as QueuePriority }
): Promise<Job | undefined> => {
  const queue = await getQueue()
  if (!queue) {
    return undefined
  }
  return queue.add(REFRESH_FEED_JOB_NAME, payload, {
    jobId: `${jobid}_${JOB_VERSION}`,
    priority: getJobPriority(`${REFRESH_FEED_JOB_NAME}_${options.priority}`),
    removeOnComplete: true,
    removeOnFail: true,
  })
}
