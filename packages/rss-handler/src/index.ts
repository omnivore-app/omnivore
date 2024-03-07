import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import crypto from 'crypto'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import Redis from 'ioredis'
import * as jwt from 'jsonwebtoken'
import { parseHTML } from 'linkedom'
import Parser, { Item } from 'rss-parser'
import { promisify } from 'util'
import { createRedisClient } from './redis'
import { CONTENT_FETCH_URL, createCloudTask } from './task'

type FolderType = 'following' | 'inbox'

interface RssFeedRequest {
  subscriptionIds: string[]
  feedUrl: string
  lastFetchedTimestamps: number[] // unix timestamp in milliseconds
  scheduledTimestamps: number[] // unix timestamp in milliseconds
  lastFetchedChecksums: string[]
  userIds: string[]
  fetchContents: boolean[]
  folders: FolderType[]
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

const fetchContentTasks = new Map<string, FetchContentTask>() // url -> FetchContentTask

export const isOldItem = (item: RssFeedItem, lastFetchedAt: number) => {
  // existing items and items that were published before 24h
  const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date()
  return (
    publishedAt <= new Date(lastFetchedAt) ||
    publishedAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
  )
}

const feedFetchFailedRedisKey = (feedUrl: string) =>
  `feed-fetch-failure:${feedUrl}`

const isFeedBlocked = async (feedUrl: string, redisClient: Redis) => {
  const key = feedFetchFailedRedisKey(feedUrl)
  try {
    const result = await redisClient.get(key)
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

const incrementFeedFailure = async (feedUrl: string, redisClient: Redis) => {
  const key = feedFetchFailedRedisKey(feedUrl)
  try {
    const result = await redisClient.incr(key)
    // expire the key in 1 day
    await redisClient.expire(key, 24 * 60 * 60)

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
  return false
}

const getThumbnail = (item: RssFeedItem) => {
  if (item['media:thumbnail']) {
    return item['media:thumbnail'].$.url
  }

  return item['media:content']?.find((media) => media.$.medium === 'image')?.$
    .url
}

function isRssFeedRequest(body: any): body is RssFeedRequest {
  return (
    'subscriptionIds' in body &&
    'feedUrl' in body &&
    'lastFetchedTimestamps' in body &&
    'scheduledTimestamps' in body &&
    'userIds' in body &&
    'lastFetchedChecksums' in body &&
    'fetchContents' in body &&
    'folders' in body
  )
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

const sendUpdateSubscriptionMutation = async (
  userId: string,
  subscriptionId: string,
  lastFetchedAt: Date,
  lastFetchedChecksum: string,
  scheduledAt: Date
) => {
  const JWT_SECRET = process.env.JWT_SECRET
  const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT

  if (!JWT_SECRET || !REST_BACKEND_ENDPOINT) {
    throw 'Environment not configured correctly'
  }

  const data = JSON.stringify({
    query: `mutation UpdateSubscription($input: UpdateSubscriptionInput!){
      updateSubscription(input:$input){
        ... on UpdateSubscriptionSuccess{
          subscription{
            id
            lastFetchedAt
          }
        }
        ... on UpdateSubscriptionError{
            errorCodes
        }
      }
    }`,
    variables: {
      input: {
        id: subscriptionId,
        lastFetchedAt,
        lastFetchedChecksum,
        scheduledAt,
      },
    },
  })

  const auth = (await signToken({ uid: userId }, JWT_SECRET)) as string
  try {
    const response = await axios.post(
      `${REST_BACKEND_ENDPOINT}/graphql`,
      data,
      {
        headers: {
          Cookie: `auth=${auth};`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30s
      }
    )

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    return !!response.data.data.updateSubscription.subscription
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('update subscription mutation error', error.message)
    } else {
      console.error(error)
    }
    return false
  }
}

const isItemRecentlySaved = async (
  redisClient: Redis,
  userId: string,
  url: string
) => {
  const key = `recent-saved-item:${userId}:${url}`
  const result = await redisClient.get(key)
  return !!result
}

const addFetchContentTask = (
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
  userId: string,
  feedUrl: string,
  item: RssFeedItem,
  fetchContent: boolean,
  folder: FolderType,
  redisClient: Redis
) => {
  const isRecentlySaved = await isItemRecentlySaved(
    redisClient,
    userId,
    item.link
  )
  if (isRecentlySaved) {
    console.log('Item recently saved', item.link)
    return true
  }

  if (folder === 'following' && !fetchContent) {
    return createItemWithPreviewContent(userId, feedUrl, item)
  }

  return addFetchContentTask(userId, folder, item)
}

const fetchContentAndCreateItem = async (
  users: User[],
  feedUrl: string,
  item: RssFeedItem
) => {
  const input = {
    users,
    source: 'rss-feeder',
    url: item.link,
    saveRequestId: '',
    labels: [{ name: 'RSS' }],
    rssFeedUrl: feedUrl,
    savedAt: item.isoDate,
    publishedAt: item.isoDate,
  }

  try {
    console.log('Creating task', input.url)
    // save page
    const task = await createCloudTask(CONTENT_FETCH_URL, input)
    console.log('Created task', task)

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
    console.log('Creating task', input.url)
    const serviceBaseUrl = process.env.INTERNAL_SVC_ENDPOINT
    const token = process.env.PUBSUB_VERIFICATION_TOKEN
    if (!serviceBaseUrl || !token) {
      throw 'Environment not configured correctly'
    }

    // save page
    const taskHandlerUrl = `${serviceBaseUrl}svc/following/save?token=${token}`
    const task = await createCloudTask(taskHandlerUrl, input)
    console.log('Created task', task)

    return !!task
  } catch (error) {
    console.error('Error while creating task', error)
    return false
  }
}

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const signToken = promisify(jwt.sign)
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
const getLink = (links: RssFeedItemLink[]): string | undefined => {
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
  return sortedLinks.find((link) => !!link)
}

const processSubscription = async (
  subscriptionId: string,
  userId: string,
  feedUrl: string,
  fetchResult: { content: string; checksum: string },
  lastFetchedAt: number,
  scheduledAt: number,
  lastFetchedChecksum: string,
  fetchContent: boolean,
  folder: FolderType,
  feed: RssFeed,
  redisClient: Redis
) => {
  let lastItemFetchedAt: Date | null = null
  let lastValidItem: RssFeedItem | null = null

  if (fetchResult.checksum === lastFetchedChecksum) {
    console.log('feed has not been updated', feedUrl, lastFetchedChecksum)
    return
  }
  const updatedLastFetchedChecksum = fetchResult.checksum

  // fetch feed
  let itemCount = 0

  const feedLastBuildDate = feed.lastBuildDate
  console.log('Feed last build date', feedLastBuildDate)
  if (
    feedLastBuildDate &&
    new Date(feedLastBuildDate) <= new Date(lastFetchedAt)
  ) {
    console.log('Skipping old feed', feedLastBuildDate)
    return
  }

  // save each item in the feed
  for (const item of feed.items) {
    // use published or updated if isoDate is not available for atom feeds
    const isoDate =
      item.isoDate || item.published || item.updated || item.created
    console.log('Processing feed item', item.links, item.isoDate, feed.feedUrl)

    if (!item.links || item.links.length === 0) {
      console.log('Invalid feed item', item)
      continue
    }

    const link = getLink(item.links)
    if (!link) {
      console.log('Invalid feed item links', item.links)
      continue
    }

    console.log('Fetching feed item', link)
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
    if (isOldItem(feedItem, lastFetchedAt)) {
      console.log('Skipping old feed item', feedItem.link)
      continue
    }

    const created = await createTask(
      userId,
      feedUrl,
      feedItem,
      fetchContent,
      folder,
      redisClient
    )
    if (!created) {
      console.error('Failed to create task for feed item', feedItem.link)
      continue
    }

    // remember the last item fetched at
    if (!lastItemFetchedAt || publishedAt > lastItemFetchedAt) {
      lastItemFetchedAt = publishedAt
    }

    itemCount = itemCount + 1
  }

  // no items saved
  if (!lastItemFetchedAt) {
    // the feed has been fetched before, no new valid items found
    if (lastFetchedAt || !lastValidItem) {
      console.log('No new valid items found')
      return
    }

    // the feed has never been fetched, save at least the last valid item
    const created = await createTask(
      userId,
      feedUrl,
      lastValidItem,
      fetchContent,
      folder,
      redisClient
    )
    if (!created) {
      console.error('Failed to create task for feed item', lastValidItem.link)
      throw new Error('Failed to create task for feed item')
    }

    lastItemFetchedAt = lastValidItem.isoDate
      ? new Date(lastValidItem.isoDate)
      : new Date()
  }

  const updateFrequency = getUpdateFrequency(feed)
  const updatePeriodInMs = getUpdatePeriodInHours(feed) * 60 * 60 * 1000
  const nextScheduledAt = scheduledAt + updatePeriodInMs * updateFrequency

  // update subscription lastFetchedAt
  const updatedSubscription = await sendUpdateSubscriptionMutation(
    userId,
    subscriptionId,
    lastItemFetchedAt,
    updatedLastFetchedChecksum,
    new Date(nextScheduledAt)
  )
  console.log('Updated subscription', updatedSubscription)
}

export const rssHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    if (req.query.token !== process.env.PUBSUB_VERIFICATION_TOKEN) {
      console.log('query does not include valid token')
      return res.sendStatus(403)
    }

    // create redis client
    const redisClient = createRedisClient(
      process.env.REDIS_URL,
      process.env.REDIS_CERT
    )

    try {
      if (!isRssFeedRequest(req.body)) {
        console.error('Invalid request body', req.body)
        return res.status(400).send('INVALID_REQUEST_BODY')
      }
      const {
        feedUrl,
        subscriptionIds,
        lastFetchedTimestamps,
        scheduledTimestamps,
        userIds,
        lastFetchedChecksums,
        fetchContents,
        folders,
      } = req.body
      console.log('Processing feed', feedUrl)

      const isBlocked = await isFeedBlocked(feedUrl, redisClient)
      if (isBlocked) {
        console.log('feed is blocked: ', feedUrl)
        return res.sendStatus(200)
      }

      const fetchResult = await fetchAndChecksum(feedUrl)
      if (!fetchResult) {
        console.error('Failed to fetch RSS feed', feedUrl)
        await incrementFeedFailure(feedUrl, redisClient)
        return res.status(500).send('FAILED_TO_FETCH_RSS_FEED')
      }

      const feed = await parseFeed(feedUrl, fetchResult.content)
      if (!feed) {
        console.error('Failed to parse RSS feed', feedUrl)
        await incrementFeedFailure(feedUrl, redisClient)
        return res.status(500).send('INVALID_RSS_FEED')
      }

      let allowFetchContent = true
      if (isContentFetchBlocked(feedUrl)) {
        console.log('fetching content blocked for feed: ', feedUrl)
        allowFetchContent = false
      }

      console.log('Fetched feed', feed.title, new Date())

      // process each subscription sequentially
      for (let i = 0; i < subscriptionIds.length; i++) {
        await processSubscription(
          subscriptionIds[i],
          userIds[i],
          feedUrl,
          fetchResult,
          lastFetchedTimestamps[i],
          scheduledTimestamps[i],
          lastFetchedChecksums[i],
          fetchContents[i] && allowFetchContent,
          folders[i],
          feed,
          redisClient
        )
      }

      // create fetch content tasks
      for (const task of fetchContentTasks.values()) {
        await fetchContentAndCreateItem(
          Array.from(task.users.values()),
          feedUrl,
          task.item
        )
      }

      res.send('ok')
    } catch (e) {
      console.error('Error while saving RSS feeds', e)
      res.status(500).send('INTERNAL_SERVER_ERROR')
    } finally {
      await redisClient.quit()
      console.log('Redis client disconnected')
    }
  }
)
