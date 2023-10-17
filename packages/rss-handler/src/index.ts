import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import * as jwt from 'jsonwebtoken'
import Parser, { Item } from 'rss-parser'
import { promisify } from 'util'
import { CONTENT_FETCH_URL, createCloudTask } from './task'

interface RssFeedRequest {
  subscriptionId: string
  feedUrl: string
  lastFetchedAt: number // unix timestamp in milliseconds
}

// link can be a string or an object
type RssFeedItemLink = string | { $: { rel?: string; href: string } }

function isRssFeedRequest(body: any): body is RssFeedRequest {
  return (
    'subscriptionId' in body && 'feedUrl' in body && 'lastFetchedAt' in body
  )
}

const sendUpdateSubscriptionMutation = async (
  userId: string,
  subscriptionId: string,
  lastFetchedAt: Date
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

const createSavingItemTask = async (
  userId: string,
  feedUrl: string,
  item: Item
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

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const signToken = promisify(jwt.sign)
const parser = new Parser({
  timeout: 60000, // 60 seconds
  maxRedirects: 10,
  customFields: {
    item: [['link', 'links', { keepArray: true }], 'published', 'updated'],
    feed: ['dc:date', 'lastBuildDate', 'pubDate'],
  },
  headers: {
    // some rss feeds require user agent
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    Accept:
      'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4',
  },
})

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

export const rssHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    if (!process.env.JWT_SECRET) {
      console.error('Missing JWT_SECRET in environment')
      return res.status(500).send('INTERNAL_SERVER_ERROR')
    }

    const token = req.header('Omnivore-Authorization')
    if (!token) {
      console.error('Missing authorization header')
      return res.status(401).send('UNAUTHORIZED')
    }

    try {
      let userId: string

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
          uid: string
        }
        userId = decoded.uid
      } catch (e) {
        console.error('Authorization error', e)
        return res.status(401).send('UNAUTHORIZED')
      }

      if (!isRssFeedRequest(req.body)) {
        console.error('Invalid request body', req.body)
        return res.status(400).send('INVALID_REQUEST_BODY')
      }

      const { feedUrl, subscriptionId, lastFetchedAt } = req.body
      console.log('Processing feed', feedUrl, lastFetchedAt)

      let lastItemFetchedAt: Date | null = null
      let lastValidItem: Item | null = null

      // fetch feed
      let itemCount = 0
      const feed = await parser.parseURL(feedUrl)
      console.log('Fetched feed', feed, new Date())

      const feedPubDate = (feed['dc:date'] ||
        feed.pubDate ||
        feed.lastBuildDate) as string | undefined
      console.log('Feed pub date', feedPubDate)
      if (feedPubDate && new Date(feedPubDate) < new Date(lastFetchedAt)) {
        console.log('Skipping old feed', feedPubDate)
        return res.send('ok')
      }

      // save each item in the feed
      for (const item of feed.items) {
        // use published or updated if isoDate is not available for atom feeds
        item.isoDate =
          item.isoDate || (item.published as string) || (item.updated as string)
        console.log('Processing feed item', item.links, item.isoDate)

        if (!item.links || item.links.length === 0) {
          console.log('Invalid feed item', item)
          continue
        }

        item.link = getLink(item.links as RssFeedItemLink[])
        if (!item.link) {
          console.log('Invalid feed item links', item.links)
          continue
        }

        console.log('Fetching feed item', item.link)

        const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date()
        // remember the last valid item
        if (
          !lastValidItem ||
          (lastValidItem.isoDate &&
            publishedAt > new Date(lastValidItem.isoDate))
        ) {
          lastValidItem = item
        }

        // Max limit per-feed update
        if (itemCount > 99) {
          continue
        }

        // skip old items and items that were published before 24h
        if (
          publishedAt < new Date(lastFetchedAt) ||
          publishedAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
        ) {
          console.log('Skipping old feed item', item.link)
          continue
        }

        const created = await createSavingItemTask(userId, feedUrl, item)
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
          return res.send('ok')
        }

        // the feed has never been fetched, save at least the last valid item
        const created = await createSavingItemTask(
          userId,
          feedUrl,
          lastValidItem
        )
        if (!created) {
          console.error(
            'Failed to create task for feed item',
            lastValidItem.link
          )
          return res.status(500).send('INTERNAL_SERVER_ERROR')
        }

        lastItemFetchedAt = lastValidItem.isoDate
          ? new Date(lastValidItem.isoDate)
          : new Date()
      }

      // update subscription lastFetchedAt
      const updatedSubscription = await sendUpdateSubscriptionMutation(
        userId,
        subscriptionId,
        lastItemFetchedAt
      )
      console.log('Updated subscription', updatedSubscription)

      res.send('ok')
    } catch (e) {
      console.error('Error while parsing RSS feed', e)
      res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  }
)
