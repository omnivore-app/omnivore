import { Job } from 'bullmq'
import { DataSource } from 'typeorm'
import { v4 as uuid } from 'uuid'
import { getBackendQueue } from '../../queue-processor'
import { validateUrl } from '../../services/create_page_save_request'
import { RssSubscriptionGroup } from '../../utils/createTask'
import { stringToHash } from '../../utils/helpers'
import { logger } from '../../utils/logger'

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
  const subscriptionGroups = (await db.createEntityManager().query(
    `
      SELECT
        url,
        ARRAY_AGG(s.id) AS "subscriptionIds",
        ARRAY_AGG(s.user_id) AS "userIds",
        ARRAY_AGG(s.most_recent_item_date) AS "mostRecentItemDates",
        ARRAY_AGG(coalesce(s.scheduled_at, NOW())) AS "scheduledDates",
        ARRAY_AGG(s.last_fetched_checksum) AS checksums,
        ARRAY_AGG(s.fetch_content) AS "fetchContents",
        ARRAY_AGG(coalesce(s.folder, $3)) AS folders
      FROM
        omnivore.subscriptions s
      INNER JOIN
        omnivore.user u ON u.id = s.user_id
      WHERE
        s.type = $1
        AND s.status = $2
        AND (s.scheduled_at <= NOW() OR s.scheduled_at IS NULL)
        AND u.status = $4
      GROUP BY
        s.url
      `,
    ['RSS', 'ACTIVE', 'following', 'ACTIVE']
  )) as RssSubscriptionGroup[]

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
  const userList = JSON.stringify(group.userIds.sort())
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
    userIds: group.userIds,
    fetchContents: group.fetchContents,
    folders: group.folders,
  }

  await queueRSSRefreshFeedJob(jobid, payload)
}

export const queueRSSRefreshAllFeedsJob = async () => {
  const queue = await getBackendQueue()
  if (!queue) {
    return false
  }
  return queue.add(
    'refresh-all-feeds',
    {},
    {
      priority: 100,
    }
  )
}

type QueuePriority = 'low' | 'high'

export const queueRSSRefreshFeedJob = async (
  jobid: string,
  payload: any,
  options = { priority: 'high' as QueuePriority }
): Promise<Job | undefined> => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }
  return queue.add('refresh-feed', payload, {
    jobId: jobid,
    removeOnComplete: true,
    removeOnFail: true,
    priority: options.priority == 'low' ? 10 : 50,
  })
}
