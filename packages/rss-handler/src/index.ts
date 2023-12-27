import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import crypto from 'crypto'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import * as jwt from 'jsonwebtoken'
import { parseHTML } from 'linkedom'
import Parser, { Item } from 'rss-parser'
import { promisify } from 'util'
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
type RssFeedItem = Item & {
  'media:thumbnail'?: RssFeedItemMedia
  'media:content'?: RssFeedItemMedia[]
}

export const isOldItem = (item: RssFeedItem, lastFetchedAt: number) => {
  // existing items and items that were published before 24h
  const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date()
  return (
    publishedAt <= new Date(lastFetchedAt) ||
    publishedAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
  )
}

const getThumbnail = (item: RssFeedItem) => {
  if (item['media:thumbnail']) {
    return item['media:thumbnail'].$.url
  }

  return item['media:content']?.find((media) => media.$.medium === 'image')?.$
    .url
}

function isRssFeedRequest(body: unknown): body is RssFeedRequest {
  return (
    body != null &&
    typeof body == 'object' &&
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
    console.log(error)
    throw new Error(`Failed to fetch or hash content from ${url}.`)
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

    return parser.parseString(content)
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
  scheduledAt: Date,
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
      },
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

const createTask = async (
  userId: string,
  feedUrl: string,
  item: RssFeedItem,
  fetchContent: boolean,
  folder: FolderType,
) => {
  if (folder === 'following' && !fetchContent) {
    return createItemWithPreviewContent(userId, feedUrl, item)
  }

  return fetchContentAndCreateItem(userId, feedUrl, item, folder)
}

const fetchContentAndCreateItem = async (
  userId: string,
  feedUrl: string,
  item: RssFeedItem,
  folder: string,
) => {
  const input = {
    userId,
    source: 'rss-feeder',
    url: item.link,
    saveRequestId: '',
    labels: [{ name: 'RSS' }],
    rssFeedUrl: feedUrl,
    savedAt: item.isoDate,
    publishedAt: item.isoDate,
    folder,
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
  item: RssFeedItem,
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
const getLink = (links: RssFeedItemLink[]) => {
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
) => {
  let lastItemFetchedAt: Date | null = null
  let lastValidItem: Item | null = null

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
    item.isoDate =
      item.isoDate || item.published || item.updated || item.created
    console.log('Processing feed item', item.links, item.isoDate, feed.feedUrl)

    if (!item.links || item.links.length === 0) {
      console.log('Invalid feed item', item)
      continue
    }

    item.link = getLink(item.links)
    if (!item.link) {
      console.log('Invalid feed item links', item.links)
      continue
    }

    console.log('Fetching feed item', item.link)

    const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date()
    // remember the last valid item
    if (
      !lastValidItem ||
      (lastValidItem.isoDate && publishedAt > new Date(lastValidItem.isoDate))
    ) {
      lastValidItem = item
    }

    // Max limit per-feed update
    if (itemCount > 99) {
      continue
    }

    // skip old items
    if (isOldItem(item, lastFetchedAt)) {
      console.log('Skipping old feed item', item.link)
      continue
    }

    const created = await createTask(
      userId,
      feedUrl,
      item,
      fetchContent,
      folder,
    )
    if (!created) {
      console.error('Failed to create task for feed item', item.link)
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
    new Date(nextScheduledAt),
  )
  console.log('Updated subscription', updatedSubscription)
}

export const rssHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    if (req.query.token !== process.env.PUBSUB_VERIFICATION_TOKEN) {
      console.log('query does not include valid token')
      return res.sendStatus(403)
    }

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

      const fetchResult = await fetchAndChecksum(feedUrl)
      const feed = await parseFeed(feedUrl, fetchResult.content)
      if (!feed) {
        console.error('Failed to parse RSS feed', feedUrl)
        return res.status(500).send('INVALID_RSS_FEED')
      }

      console.log('Fetched feed', feed.title, new Date())

      await Promise.all(
        subscriptionIds.map((_, i) =>
          processSubscription(
            subscriptionIds[i],
            userIds[i],
            feedUrl,
            fetchResult,
            lastFetchedTimestamps[i],
            scheduledTimestamps[i],
            lastFetchedChecksums[i],
            fetchContents[i],
            folders[i],
            feed,
          ),
        ),
      )

      res.send('ok')
    } catch (e) {
      console.error('Error while saving RSS feeds', e)
      res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  },
)
