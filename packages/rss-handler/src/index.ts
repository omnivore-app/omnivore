import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import * as jwt from 'jsonwebtoken'
import Parser from 'rss-parser'
import { promisify } from 'util'

interface RssFeedRequest {
  subscriptionId: string
  userId: string
  feedUrl: string
}

function isRssFeedRequest(body: any): body is RssFeedRequest {
  return 'subscriptionId' in body && 'userId' in body && 'feedUrl' in body
}

const sendSavePageMutation = async (userId: string, input: unknown) => {
  const JWT_SECRET = process.env.JWT_SECRET
  const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT

  if (!JWT_SECRET || !REST_BACKEND_ENDPOINT) {
    throw 'Environment not configured correctly'
  }

  const data = JSON.stringify({
    query: `mutation SavePage ($input: SavePageInput!){
          savePage(input:$input){
            ... on SaveSuccess{
              url
              clientRequestId
            }
            ... on SaveError{
                errorCodes
            }
          }
    }`,
    variables: {
      input: Object.assign({}, input, { source: 'puppeteer-parse' }),
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
      console.error('save page mutation error', error.message)
    } else {
      console.error(error)
    }
    return false
  }
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

      const { userId, feedUrl, subscriptionId } = req.body
      // fetch feed
      const feed = await parser.parseURL(feedUrl)
      const lastFetchedAt = new Date()
      console.log('Fetched feed', feed.title, lastFetchedAt)

      // save each item in the feed
      for (const item of feed.items) {
        if (!item.link || !item.title || !item.content) {
          console.log('Invalid feed item', item)
          continue
        }

        const input = {
          source: 'rss-feeder',
          url: item.link,
          saveRequestId: '',
          labels: [{ name: 'RSS' }],
          title: item.title,
          originalContent: item.content,
        }

        try {
          console.log('Saving page', input.title)
          // save page
          const result = await sendSavePageMutation(userId, input)
          console.log('Saved page', result)
        } catch (error) {
          console.error('Error while saving page', error)
        }
      }

      // update subscription lastFetchedAt
      const updatedSubscription = await sendUpdateSubscriptionMutation(
        userId,
        subscriptionId,
        lastFetchedAt
      )
      console.log('Updated subscription', updatedSubscription)

      res.send('ok')
    } catch (e) {
      console.error('Error while parsing RSS feed', e)
      res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  }
)
