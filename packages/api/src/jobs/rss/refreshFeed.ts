import axios from 'axios'
import crypto from 'crypto'
import { parseHTML } from 'linkedom'
import Parser, { Item } from 'rss-parser'
import { SubscriptionStatus } from '../../entity/subscription'
import { env } from '../../env'
import { redisDataSource } from '../../redis_data_source'
import { validateUrl } from '../../services/create_page_save_request'
import {
  updateSubscription,
  updateSubscriptions,
} from '../../services/update_subscription'
import createHttpTaskWithToken from '../../utils/createTask'
import { RSSRefreshContext } from './refreshAllFeeds'

type FolderType = 'following' | 'inbox'

interface RefreshFeedRequest {
  subscriptionIds: string[]
  feedUrl: string
  mostRecentItemDates: number[] // unix timestamp in milliseconds
  scheduledTimestamps: number[] // unix timestamp in milliseconds
  lastFetchedChecksums: string[]
  userIds: string[]
  fetchContents: boolean[]
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
    'fetchContents' in data &&
    'folders' in data
  )
}

// link can be a string or an object
type RssFeedItemLink = string | { $: { rel?: string; href: string } }
type RssFeed = Parser.Output<{
  published?: string
  updated?: string
  created?: string
  link?: RssFeedItemLink
  links?: RssFeedItemLink[]
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

interface User {
  id: string
  folder: FolderType
}

interface FetchContentTask {
  users: Map<string, User> // userId -> User
  item: RssFeedItem
}

export const isOldItem = (
  item: RssFeedItem,
  mostRecentItemTimestamp: number
) => {
  // existing items and items that were published before 24h
  const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date()
  return (
    publishedAt <= new Date(mostRecentItemTimestamp) ||
    publishedAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
  )
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
      console.log('feed is blocked: ', feedUrl)
      return true
    }
  } catch (error) {
    console.error('Failed to check feed block status', feedUrl, error)
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
    console.error('Failed to block feed', feedUrl, error)
    return null
  }
}

export const isContentFetchBlocked = (feedUrl: string) => {
  if (feedUrl.startsWith('https://arxiv.org/')) {
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

  return item['media:content']?.find((media) => media.$.medium === 'image')?.$
    .url
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
    console.log(`Failed to fetch or hash content from ${url}.`, error)
    return null
  }
}

const parseFeed = async (url: string, content: string) => {
  try {
    // check if url is a telegram channel
    const telegramRegex = /https:\/\/t\.me\/([a-zA-Z0-9_]+)/
    const telegramMatch = url.match(telegramRegex)
    if (telegramMatch) {
      const dom = parseHTML(content).document
      const title = dom.querySelector('meta[property="og:title"]')
      // post has attribute data-post
      const posts = dom.querySelectorAll('[data-post]')
      const items = Array.from(posts)
        .map((post) => {
          const id = post.getAttribute('data-post')
          if (!id) {
            return null
          }

          const url = `https://t.me/${telegramMatch[1]}/${id}`
          // find the <time> element
          const time = post.querySelector('time')
          const dateTime = time?.getAttribute('datetime') || undefined

          return {
            link: url,
            isoDate: dateTime,
          }
        })
        .filter((item) => !!item) as RssFeedItem[]

      return {
        title: title?.getAttribute('content') || dom.title,
        items,
      }
    }

    // return await is needed to catch errors thrown by the parser
    // otherwise the error will be caught by the outer try catch
    return await parser.parseString(content)
  } catch (error) {
    console.log(error)
    return null
  }
}

const isItemRecentlySaved = async (userId: string, url: string) => {
  const key = `recent-saved-item:${userId}:${url}`
  try {
    const result = await redisDataSource.redisClient?.get(key)
    return !!result
  } catch (err) {
    console.error('error checking if item is old', err)
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
  if (!task) {
    fetchContentTasks.set(url, {
      users: new Map([[userId, { id: userId, folder }]]),
      item,
    })
  } else {
    task.users.set(userId, { id: userId, folder })
  }

  return true
}

const createTask = async (
  fetchContentTasks: Map<string, FetchContentTask>,
  userId: string,
  feedUrl: string,
  item: RssFeedItem,
  fetchContent: boolean,
  folder: FolderType
) => {
  const isRecentlySaved = await isItemRecentlySaved(userId, item.link)
  if (isRecentlySaved) {
    console.log('Item recently saved', item.link)
    return true
  }

  if (folder === 'following' && !fetchContent) {
    return createItemWithPreviewContent(userId, feedUrl, item)
  }

  console.log(`adding fetch content task ${userId}  ${item.link.trim()}`)
  return addFetchContentTask(fetchContentTasks, userId, folder, item)
}

const fetchContentAndCreateItem = async (
  users: User[],
  feedUrl: string,
  item: RssFeedItem
) => {
  const payload = {
    users,
    source: 'rss-feeder',
    url: item.link.trim(),
    saveRequestId: '',
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
    console.error('Error while creating task', error)
    return false
  }
}

const createItemWithPreviewContent = async (
  userId: string,
  feedUrl: string,
  item: RssFeedItem
) => {
  const input = {
    userIds: [userId],
    url: item.link,
    title: item.title,
    author: item.creator,
    description: item.summary,
    addedToFollowingFrom: 'feed',
    previewContent: item.content || item.contentSnippet || item.summary,
    addedToFollowingBy: feedUrl,
    savedAt: item.isoDate,
    publishedAt: item.isoDate,
    previewContentType: 'text/html', // TODO: get content type from feed
    thumbnail: getThumbnail(item),
  }

  try {
    const serviceBaseUrl = process.env.INTERNAL_API_URL
    const token = process.env.PUBSUB_VERIFICATION_TOKEN
    if (!serviceBaseUrl || !token) {
      throw 'Environment not configured correctly'
    }

    // save page
    const taskHandlerUrl = `${serviceBaseUrl}/svc/following/save?token=${token}`
    const task = await createHttpTaskWithToken({
      queue: env.queue.name,
      priority: 'low',
      taskHandlerUrl: taskHandlerUrl,
      payload: input,
    })
    return !!task
  } catch (error) {
    console.error('Error while creating task', error)
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

const processSubscription = async (
  fetchContentTasks: Map<string, FetchContentTask>,
  subscriptionId: string,
  userId: string,
  feedUrl: string,
  fetchResult: { content: string; checksum: string },
  mostRecentItemDate: number,
  scheduledAt: number,
  lastFetchedChecksum: string,
  fetchContent: boolean,
  folder: FolderType,
  feed: RssFeed
) => {
  const refreshedAt = new Date()

  let lastItemFetchedAt: Date | null = null
  let lastValidItem: RssFeedItem | null = null

  if (fetchResult.checksum === lastFetchedChecksum) {
    console.log('feed has not been updated', feedUrl, lastFetchedChecksum)
    return
  }
  const updatedLastFetchedChecksum = fetchResult.checksum

  // fetch feed
  let itemCount = 0,
    failedAt: Date | undefined

  const feedLastBuildDate = feed.lastBuildDate
  console.log('Feed last build date', feedLastBuildDate)
  if (
    feedLastBuildDate &&
    new Date(feedLastBuildDate) <= new Date(mostRecentItemDate)
  ) {
    console.log('Skipping old feed', feedLastBuildDate)
    return
  }

  // save each item in the feed
  for (const item of feed.items) {
    try {
      // use published or updated if isoDate is not available for atom feeds
      const isoDate =
        item.isoDate || item.published || item.updated || item.created
      console.log('Processing feed item', item.links, item.isoDate, feedUrl)

      if (!item.links || item.links.length === 0) {
        throw new Error('Invalid feed item')
      }

      const link = getLink(item.links, feedUrl)
      if (!link) {
        throw new Error('Invalid feed item link')
      }

      const feedItem = {
        ...item,
        isoDate,
        link,
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
        continue
      }

      // skip old items
      if (isOldItem(feedItem, mostRecentItemDate)) {
        console.log('Skipping old feed item', feedItem.link)
        continue
      }

      const created = await createTask(
        fetchContentTasks,
        userId,
        feedUrl,
        feedItem,
        fetchContent,
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
      console.error('Error while saving RSS feed item', error, item)
      failedAt = new Date()
    }
  }

  // no items saved
  if (!lastItemFetchedAt) {
    // the feed has been fetched before, no new valid items found
    if (mostRecentItemDate || !lastValidItem) {
      console.log('No new valid items found')
      return
    }

    // the feed has never been fetched, save at least the last valid item
    const created = await createTask(
      fetchContentTasks,
      userId,
      feedUrl,
      lastValidItem,
      fetchContent,
      folder
    )
    if (!created) {
      console.error('Failed to create task for feed item', lastValidItem.link)
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
  console.log('Updated subscription', updatedSubscription)
}

export const refreshFeed = async (request: any) => {
  if (isRefreshFeedRequest(request)) {
    return _refreshFeed(request)
  }
  console.log('not a feed to refresh')
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
    fetchContents,
    folders,
    refreshContext,
  } = request

  console.log('Processing feed', feedUrl, { refreshContext: refreshContext })

  try {
    const isBlocked = await isFeedBlocked(feedUrl)
    if (isBlocked) {
      console.log('feed is blocked: ', feedUrl)
      throw new Error('feed is blocked')
    }

    const fetchResult = await fetchAndChecksum(feedUrl)
    if (!fetchResult) {
      console.error('Failed to fetch RSS feed', feedUrl)
      await incrementFeedFailure(feedUrl)
      throw new Error('Failed to fetch RSS feed')
    }

    const feed = await parseFeed(feedUrl, fetchResult.content)
    if (!feed) {
      console.error('Failed to parse RSS feed', feedUrl)
      await incrementFeedFailure(feedUrl)
      throw new Error('Failed to parse RSS feed')
    }

    let allowFetchContent = true
    if (isContentFetchBlocked(feedUrl)) {
      console.log('fetching content blocked for feed: ', feedUrl)
      allowFetchContent = false
    }

    console.log('Fetched feed', feed.title, new Date())

    const fetchContentTasks = new Map<string, FetchContentTask>() // url -> FetchContentTask
    // process each subscription sequentially
    for (let i = 0; i < subscriptionIds.length; i++) {
      const subscriptionId = subscriptionIds[i]

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
          fetchContents[i] && allowFetchContent,
          folders[i],
          feed
        )
      } catch (error) {
        console.error('Error while processing subscription', {
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
    console.error('Error while saving RSS feeds', {
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
