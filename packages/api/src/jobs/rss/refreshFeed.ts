import axios from 'axios'
import crypto from 'crypto'
import { parseHTML } from 'linkedom'
import Parser, { Item } from 'rss-parser'
import { v4 as uuid } from 'uuid'
import { FetchContentType } from '../../entity/subscription'
import { env } from '../../env'
import { ArticleSavingRequestStatus } from '../../generated/graphql'
import { redisDataSource } from '../../redis_data_source'
import { validateUrl } from '../../services/create_page_save_request'
import { savePage } from '../../services/save_page'
import {
  updateSubscription,
  updateSubscriptions,
} from '../../services/update_subscription'
import { findActiveUser } from '../../services/user'
import createHttpTaskWithToken from '../../utils/createTask'
import { cleanUrl } from '../../utils/helpers'
import { createThumbnailProxyUrl } from '../../utils/imageproxy'
import { logger } from '../../utils/logger'
import { RSSRefreshContext } from './refreshAllFeeds'

type FolderType = 'following' | 'inbox'

interface RefreshFeedRequest {
  subscriptionIds: string[]
  feedUrl: string
  mostRecentItemDates: number[] // unix timestamp in milliseconds
  scheduledTimestamps: number[] // unix timestamp in milliseconds
  lastFetchedChecksums: string[]
  userIds: string[]
  fetchContentTypes: FetchContentType[]
  folders: FolderType[]
  refreshContext?: RSSRefreshContext
}

export const isRefreshFeedRequest = (data: any): data is RefreshFeedRequest => {
  return (
    'subscriptionIds' in data &&
    'feedUrl' in data &&
    'mostRecentItemDates' in data &&
    'scheduledTimestamps' in data &&
    'userIds' in data &&
    'lastFetchedChecksums' in data &&
    'fetchContentTypes' in data &&
    'folders' in data
  )
}

// link can be a string or an object
type RssFeedItemLink = string | { $: { rel?: string; href: string } }
type RssFeedItemAuthor = string | { name: string }
type RssFeed = Parser.Output<{
  published?: string
  updated?: string
  created?: string
  link?: RssFeedItemLink
  links?: RssFeedItemLink[]
  author?: RssFeedItemAuthor
}> & {
  lastBuildDate?: string
  'syn:updatePeriod'?: string
  'syn:updateFrequency'?: string
  'sy:updatePeriod'?: string
  'sy:updateFrequency'?: string
}
type RssFeedItemMedia = {
  $: { url: string; width?: string; height?: string; medium?: string }
}
export type RssFeedItem = Item & {
  'media:thumbnail'?: RssFeedItemMedia
  'media:content'?: RssFeedItemMedia[]
  link: string
}

interface UserConfig {
  id: string
  folder: FolderType
  libraryItemId: string
}

interface FetchContentTask {
  users: Map<string, UserConfig> // userId -> User
  item: RssFeedItem
}

export const isOldItem = (
  item: RssFeedItem,
  mostRecentItemTimestamp: number
) => {
  // always fetch items without isoDate
  if (!item.isoDate) {
    return false
  }

  const publishedAt = new Date(item.isoDate)

  // don't fetch older than 24 hrs items for new feeds
  if (!mostRecentItemTimestamp) {
    return publishedAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
  }

  // don't fetch existing items for old feeds
  return publishedAt <= new Date(mostRecentItemTimestamp)
}

const feedFetchFailedRedisKey = (feedUrl: string) =>
  `feed-fetch-failure:${feedUrl}`

const isFeedBlocked = async (feedUrl: string) => {
  const key = feedFetchFailedRedisKey(feedUrl)
  const redisClient = redisDataSource.redisClient
  try {
    const result = await redisClient?.get(key)
    // if the feed has failed to fetch more than certain times, block it
    const maxFailures = parseInt(process.env.MAX_FEED_FETCH_FAILURES ?? '10')
    if (result && parseInt(result) > maxFailures) {
      logger.info(`feed is blocked: ${feedUrl}`)
      return true
    }
  } catch (error) {
    logger.error('Failed to check feed block status', { feedUrl, error })
  }

  return false
}

const incrementFeedFailure = async (feedUrl: string) => {
  const redisClient = redisDataSource.redisClient
  const key = feedFetchFailedRedisKey(feedUrl)
  try {
    const result = await redisClient?.incr(key)
    // expire the key in 1 day
    await redisClient?.expire(key, 24 * 60 * 60)

    return result
  } catch (error) {
    logger.error('Failed to block feed', { feedUrl, error })
    return null
  }
}

export const isContentFetchBlocked = (feedUrl: string) => {
  if (feedUrl.startsWith('https://arxiv.org/')) {
    return true
  }
  if (feedUrl.startsWith('https://rss.arxiv.org')) {
    return true
  }
  if (feedUrl.startsWith('https://rsshub.app')) {
    return true
  }
  if (feedUrl.startsWith('https://xkcd.com')) {
    return true
  }
  if (feedUrl.startsWith('https://daringfireball.net/feeds/')) {
    return true
  }
  if (feedUrl.startsWith('https://lwn.net/headlines/newrss')) {
    return true
  }
  if (feedUrl.startsWith('https://medium.com')) {
    return true
  }
  return false
}

const getThumbnail = (item: RssFeedItem) => {
  if (item['media:thumbnail']) {
    return item['media:thumbnail'].$.url
  }

  if (item['media:content']) {
    return item['media:content'].find((media) => media.$?.medium === 'image')?.$
      .url
  }

  return undefined
}

export const fetchAndChecksum = async (url: string) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60_000,
      maxRedirects: 10,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        Accept:
          'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml, text/html;q=0.4',
      },
    })

    const hash = crypto.createHash('sha256')
    hash.update(response.data as Buffer)

    const dataStr = (response.data as Buffer).toString()

    return { url, content: dataStr, checksum: hash.digest('hex') }
  } catch (error) {
    logger.info(`Failed to fetch or hash content from ${url}.`, error)
    return null
  }
}

const parseFeed = async (url: string, content: string) => {
  try {
    // check if url is a telegram channel or preview
    const telegramRegex = /t\.me\/([^/]+)/
    const telegramMatch = url.match(telegramRegex)
    if (telegramMatch) {
      let channel = telegramMatch[1]
      if (channel.startsWith('s/')) {
        channel = channel.slice(2)
      } else {
        // open the preview page to get the data
        const fetchResult = await fetchAndChecksum(`https://t.me/s/${channel}`)
        if (!fetchResult) {
          return null
        }

        content = fetchResult.content
      }

      const dom = parseHTML(content).document
      const title =
        dom
          .querySelector('meta[property="og:title"]')
          ?.getAttribute('content') || dom.title
      // post has attribute data-post
      const posts = dom.querySelectorAll('[data-post]')
      const items = Array.from(posts)
        .map((post) => {
          const id = post.getAttribute('data-post')?.split('/')[1]
          if (!id) {
            return null
          }

          const url = `https://t.me/s/${channel}/${id}`
          const content = post.outerHTML

          // find the <time> element
          const time = post.querySelector('time')
          const dateTime = time?.getAttribute('datetime') || undefined

          return {
            link: url,
            isoDate: dateTime,
            title: `${title} - ${id}`,
            creator: title,
            content,
            links: [url],
          }
        })
        .filter((item) => !!item) as RssFeedItem[]

      return {
        title,
        items,
      }
    }

    // return await is needed to catch errors thrown by the parser
    // otherwise the error will be caught by the outer try catch
    return await parser.parseString(content)
  } catch (error) {
    logger.info(error)
    return null
  }
}

const isItemRecentlySaved = async (userId: string, url: string) => {
  const key = `recent-saved-item:${userId}:${url}`
  try {
    const result = await redisDataSource.redisClient?.get(key)
    return !!result
  } catch (err) {
    logger.error('error checking if item is old', err)
  }
  // If we failed to check, assume the item is good
  return false
}

const addFetchContentTask = (
  fetchContentTasks: Map<string, FetchContentTask>,
  userId: string,
  folder: FolderType,
  item: RssFeedItem
) => {
  const url = item.link
  const task = fetchContentTasks.get(url)
  const libraryItemId = uuid()
  const userConfig = { id: userId, folder, libraryItemId }

  if (!task) {
    fetchContentTasks.set(url, {
      users: new Map([[userId, userConfig]]),
      item,
    })
  } else {
    task.users.set(userId, userConfig)
  }

  return true
}

const createTask = async (
  fetchContentTasks: Map<string, FetchContentTask>,
  userId: string,
  feedUrl: string,
  item: RssFeedItem,
  fetchContentType: FetchContentType,
  folder: FolderType
) => {
  const isRecentlySaved = await isItemRecentlySaved(userId, item.link)
  if (isRecentlySaved) {
    logger.info(`Item recently saved ${item.link}`)
    return true
  }

  const feedContent = item.content || item.contentSnippet || item.summary
  if (
    fetchContentType === FetchContentType.Never ||
    (fetchContentType === FetchContentType.WhenEmpty && feedContent)
  ) {
    return createItemWithFeedContent(userId, feedUrl, item, folder, feedContent)
  }

  logger.info(`adding fetch content task ${userId}  ${item.link.trim()}`)
  return addFetchContentTask(fetchContentTasks, userId, folder, item)
}

const fetchContentAndCreateItem = async (
  users: UserConfig[],
  feedUrl: string,
  item: RssFeedItem
) => {
  const payload = {
    users,
    source: 'rss-feeder',
    url: item.link.trim(),
    labels: [{ name: 'RSS' }],
    rssFeedUrl: feedUrl,
    savedAt: item.isoDate,
    publishedAt: item.isoDate,
  }

  try {
    const task = await createHttpTaskWithToken({
      queue: 'omnivore-rss-feed-queue',
      taskHandlerUrl: env.queue.contentFetchGCFUrl,
      payload,
    })
    return !!task
  } catch (error) {
    logger.error('Error while creating task', error)
    return false
  }
}

const createItemWithFeedContent = async (
  userId: string,
  feedUrl: string,
  item: RssFeedItem,
  folder: FolderType,
  feedContent?: string
) => {
  try {
    logger.info('saving feed item with feed content', {
      userId,
      feedUrl,
      item,
      folder,
    })

    const thumbnail = getThumbnail(item)
    const previewImage = thumbnail && createThumbnailProxyUrl(thumbnail)
    const url = cleanUrl(item.link)

    const user = await findActiveUser(userId)
    if (!user) {
      logger.error('User not found', { userId })
      return false
    }

    const result = await savePage(
      {
        url,
        feedContent,
        title: item.title,
        folder,
        rssFeedUrl: feedUrl,
        savedAt: item.isoDate,
        publishedAt: item.isoDate,
        originalContent: feedContent || '',
        source: 'rss-feeder',
        state: ArticleSavingRequestStatus.ContentNotFetched,
        clientRequestId: '',
        author: item.creator,
        previewImage,
        labels: [{ name: 'RSS' }],
      },
      user
    )

    if (result.__typename === 'SaveError') {
      logger.error(
        `Error while saving feed item with feed content: ${result.errorCodes[0]}`
      )
      return false
    }

    return true
  } catch (error) {
    logger.error('Error while saving feed item with feed content', error)
    return false
  }
}

const parser = new Parser({
  customFields: {
    item: [
      ['link', 'links', { keepArray: true }],
      'published',
      'updated',
      'created',
      ['media:content', 'media:content', { keepArray: true }],
      ['media:thumbnail'],
      'author',
    ],
    feed: [
      'lastBuildDate',
      'syn:updatePeriod',
      'syn:updateFrequency',
      'sy:updatePeriod',
      'sy:updateFrequency',
    ],
  },
})

const getUpdateFrequency = (feed: RssFeed) => {
  const updateFrequency =
    feed['syn:updateFrequency'] || feed['sy:updateFrequency']

  if (!updateFrequency) {
    return 1
  }

  const frequency = parseInt(updateFrequency, 10)
  if (isNaN(frequency)) {
    return 1
  }

  return frequency
}

const getUpdatePeriodInHours = (feed: RssFeed) => {
  const updatePeriod = feed['syn:updatePeriod'] || feed['sy:updatePeriod']

  switch (updatePeriod) {
    case 'hourly':
      return 1
    case 'daily':
      return 24
    case 'weekly':
      return 7 * 24
    case 'monthly':
      return 30 * 24
    case 'yearly':
      return 365 * 24
    default:
      // default to hourly
      return 1
  }
}

// get link following the order of preference: via, alternate, self
const getLink = (
  links: RssFeedItemLink[],
  feedUrl: string
): string | undefined => {
  // sort links by preference
  const sortedLinks: string[] = []

  links.forEach((link) => {
    // if link is a string, it is the href
    if (typeof link === 'string') {
      return sortedLinks.push(link)
    }

    if (link.$.rel === 'via') {
      sortedLinks[0] = link.$.href
    }
    if (link.$.rel === 'alternate') {
      sortedLinks[1] = link.$.href
    }
    if (link.$.rel === 'self' || !link.$.rel) {
      sortedLinks[2] = link.$.href
    }
  })

  // return the first link that is not undefined
  const itemUrl = sortedLinks.find((link) => !!link)
  if (!itemUrl) {
    return undefined
  }

  // convert relative url to absolute url
  const url = new URL(itemUrl, feedUrl).href
  if (!validateUrl(url)) {
    return undefined
  }

  return url
}

// get author
const getAuthor = (author: RssFeedItemAuthor) => {
  if (typeof author === 'string') {
    return author
  }
  return author.name
}

const processSubscription = async (
  fetchContentTasks: Map<string, FetchContentTask>,
  subscriptionId: string,
  userId: string,
  feedUrl: string,
  fetchResult: { content: string; checksum: string },
  mostRecentItemDate: number,
  scheduledAt: number,
  lastFetchedChecksum: string,
  fetchContentType: FetchContentType,
  folder: FolderType,
  feed: RssFeed
) => {
  const refreshedAt = new Date()

  let lastItemFetchedAt: Date | null = null
  let lastValidItem: RssFeedItem | null = null

  if (fetchResult.checksum === lastFetchedChecksum) {
    logger.info('feed has not been updated', { feedUrl, lastFetchedChecksum })
    return
  }
  const updatedLastFetchedChecksum = fetchResult.checksum

  // fetch feed
  let itemCount = 0,
    failedAt: Date | null = null

  const feedLastBuildDate = feed.lastBuildDate
  logger.info(`Feed last build date ${feedLastBuildDate || 'N/A'}`)
  if (
    feedLastBuildDate &&
    new Date(feedLastBuildDate) <= new Date(mostRecentItemDate)
  ) {
    logger.info(`Skipping old feed ${feedLastBuildDate}`)
    return
  }

  // save each item in the feed
  for (const item of feed.items) {
    try {
      const guid = item.guid || item.link
      // use published or updated if isoDate is not available for atom feeds
      const isoDate =
        item.isoDate || item.published || item.updated || item.created

      logger.info('Processing feed item', {
        guid,
        links: item.links,
        isoDate,
        feedUrl,
      })

      if (!item.links || item.links.length === 0 || !guid) {
        throw new Error('Invalid feed item')
      }

      // fallback to guid if link is not available
      const link = getLink(item.links, feedUrl) || guid
      if (!link) {
        throw new Error('Invalid feed item link')
      }

      const creator = item.creator || (item.author && getAuthor(item.author))

      const feedItem = {
        ...item,
        isoDate,
        link,
        creator,
      }

      const publishedAt = feedItem.isoDate
        ? new Date(feedItem.isoDate)
        : new Date()
      // remember the last valid item
      if (
        !lastValidItem ||
        (lastValidItem.isoDate && publishedAt > new Date(lastValidItem.isoDate))
      ) {
        lastValidItem = feedItem
      }

      // Max limit per-feed update
      if (itemCount > 99) {
        if (itemCount == 100) {
          logger.info(`Max limit reached for feed ${feedUrl}`)
        }
        itemCount = itemCount + 1
        continue
      }

      // skip old items
      if (isOldItem(feedItem, mostRecentItemDate)) {
        logger.info(`Skipping old feed item ${feedItem.link}`)
        continue
      }

      const created = await createTask(
        fetchContentTasks,
        userId,
        feedUrl,
        feedItem,
        fetchContentType,
        folder
      )
      if (!created) {
        throw new Error('Failed to create task for feed item')
      }

      // remember the last item fetched at
      if (!lastItemFetchedAt || publishedAt > lastItemFetchedAt) {
        lastItemFetchedAt = publishedAt
      }

      itemCount = itemCount + 1
    } catch (error) {
      logger.error('Error while saving RSS feed item', { error, item })
      failedAt = new Date()
    }
  }

  // no items saved
  if (!lastItemFetchedAt && !failedAt) {
    // the feed has been fetched before, no new valid items found
    if (mostRecentItemDate || !lastValidItem) {
      logger.info('No new valid items found')
      return
    }

    // the feed has never been fetched, save at least the last valid item
    const created = await createTask(
      fetchContentTasks,
      userId,
      feedUrl,
      lastValidItem,
      fetchContentType,
      folder
    )
    if (!created) {
      logger.error('Failed to create task for feed item', {
        url: lastValidItem.link,
      })
      failedAt = new Date()
    }

    lastItemFetchedAt = lastValidItem.isoDate
      ? new Date(lastValidItem.isoDate)
      : refreshedAt
  }

  const updateFrequency = getUpdateFrequency(feed)
  const updatePeriodInMs = getUpdatePeriodInHours(feed) * 60 * 60 * 1000
  const nextScheduledAt = scheduledAt + updatePeriodInMs * updateFrequency

  // update subscription mostRecentItemDate and refreshedAt
  const updatedSubscription = await updateSubscription(userId, subscriptionId, {
    mostRecentItemDate: lastItemFetchedAt,
    lastFetchedChecksum: updatedLastFetchedChecksum,
    scheduledAt: new Date(nextScheduledAt),
    refreshedAt,
    failedAt,
  })
  logger.info('Updated subscription', updatedSubscription)
}

export const refreshFeed = async (request: any) => {
  if (isRefreshFeedRequest(request)) {
    return _refreshFeed(request)
  }
  logger.info('not a feed to refresh')
  return false
}

export const _refreshFeed = async (request: RefreshFeedRequest) => {
  const {
    feedUrl,
    subscriptionIds,
    mostRecentItemDates,
    scheduledTimestamps,
    userIds,
    lastFetchedChecksums,
    fetchContentTypes,
    folders,
    refreshContext,
  } = request

  logger.info('Processing feed', feedUrl, { refreshContext: refreshContext })

  try {
    const isBlocked = await isFeedBlocked(feedUrl)
    if (isBlocked) {
      logger.info(`feed is blocked: ${feedUrl}`)
      throw new Error('feed is blocked')
    }

    const fetchResult = await fetchAndChecksum(feedUrl)
    if (!fetchResult) {
      logger.error(`Failed to fetch RSS feed ${feedUrl}`)
      await incrementFeedFailure(feedUrl)
      throw new Error('Failed to fetch RSS feed')
    }

    const feed = await parseFeed(feedUrl, fetchResult.content)
    if (!feed) {
      logger.error(`Failed to parse RSS feed ${feedUrl}`)
      await incrementFeedFailure(feedUrl)
      throw new Error('Failed to parse RSS feed')
    }

    let allowFetchContent = true
    if (isContentFetchBlocked(feedUrl)) {
      logger.info(`fetching content blocked for feed: ${feedUrl}`)
      allowFetchContent = false
    }

    logger.info('Fetched feed', { title: feed.title, at: new Date() })

    const fetchContentTasks = new Map<string, FetchContentTask>() // url -> FetchContentTask
    // process each subscription sequentially
    for (let i = 0; i < subscriptionIds.length; i++) {
      const subscriptionId = subscriptionIds[i]
      const fetchContentType = allowFetchContent
        ? fetchContentTypes[i]
        : FetchContentType.Never

      try {
        await processSubscription(
          fetchContentTasks,
          subscriptionId,
          userIds[i],
          feedUrl,
          fetchResult,
          mostRecentItemDates[i],
          scheduledTimestamps[i],
          lastFetchedChecksums[i],
          fetchContentType,
          folders[i],
          feed
        )
      } catch (error) {
        logger.error('Error while processing subscription', {
          error,
          subscriptionId,
        })
      }
    }

    // create fetch content tasks
    for (const task of fetchContentTasks.values()) {
      await fetchContentAndCreateItem(
        Array.from(task.users.values()),
        feedUrl,
        task.item
      )
    }

    return true
  } catch (error) {
    logger.error('Error while saving RSS feeds', {
      feedUrl,
      subscriptionIds,
      error,
    })

    const now = new Date()
    // mark subscriptions as error if we failed to get the feed
    await updateSubscriptions(subscriptionIds, {
      refreshedAt: now,
      failedAt: now,
    })

    return false
  }
}
