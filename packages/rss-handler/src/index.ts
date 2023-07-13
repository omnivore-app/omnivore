import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import * as jwt from 'jsonwebtoken'
import Parser from 'rss-parser'
import { promisify } from 'util'
import { CONTENT_FETCH_URL, createCloudTask } from './task'

interface RssFeedRequest {
  subscriptionId: string
  userId: string
  feedUrl: string
  lastFetchedAt: string
}

function isRssFeedRequest(body: any): body is RssFeedRequest {
  return (
    'subscriptionId' in body &&
    'userId' in body &&
    'feedUrl' in body &&
    'lastFetchedAt' in body
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
    return !!response.data.data.savePage
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('update subscription mutation error', error.message)
    } else {
      console.error(error)
    }
    return false
  }
}

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const signToken = promisify(jwt.sign)
const parser = new Parser()

export const rssHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    if (!process.env.JWT_SECRET) {
      console.error('Missing JWT_SECRET in environment')
      return res.status(500).send('INTERNAL_SERVER_ERROR')
    }

    try {
      if (!isRssFeedRequest(req.body)) {
        console.error('Invalid request body', req.body)
        return res.status(400).send('INVALID_REQUEST_BODY')
      }

      const { userId, feedUrl, subscriptionId, lastFetchedAt } = req.body
      console.log('Processing feed', feedUrl, lastFetchedAt)

      // fetch feed
      const feed = await parser.parseURL(feedUrl)
      const newFetchedAt = new Date()
      console.log('Fetched feed', feed.title, newFetchedAt)

      // save each item in the feed
      for await (const item of feed.items) {
        const publishedAt = item.pubDate || item.isoDate
        console.log('Processing feed item', item.link, publishedAt)

        if (!item.link || !publishedAt) {
          console.log('Invalid feed item', item)
          continue
        }

        if (new Date(publishedAt) <= new Date(lastFetchedAt)) {
          console.log('Skipping old feed item', item.link)
          continue
        }

        const input = {
          userId,
          source: 'rss-feeder',
          url: item.link,
          saveRequestId: '',
          labels: [{ name: 'RSS' }],
          rssFeedUrl: feedUrl,
        }

        try {
          console.log('Creating task', input.url)
          // save page
          const task = await createCloudTask(CONTENT_FETCH_URL, input)
          console.log('Created task', task)
        } catch (error) {
          console.error('Error while creating task', error)
        }
      }

      // update subscription lastFetchedAt
      const updatedSubscription = await sendUpdateSubscriptionMutation(
        userId,
        subscriptionId,
        newFetchedAt
      )
      console.log('Updated subscription', updatedSubscription)

      res.send('ok')
    } catch (e) {
      console.error('Error while parsing RSS feed', e)
      res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  }
)
