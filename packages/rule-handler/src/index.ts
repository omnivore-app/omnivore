import * as Sentry from '@sentry/serverless'
import * as dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { getEnabledRules, RuleEventType, triggerActions } from './rule'

const signToken = promisify(jwt.sign)

dotenv.config()

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

interface PubSubRequestMessage {
  data: string
  publishTime: string
}

interface PubSubRequestBody {
  message: PubSubRequestMessage
  subscription: string
}

export interface PubSubData {
  id: string
  userId: string
  type: EntityType
  subscription: string
  image: string
  content: string
  readingProgressPercent: number
  pageType: string
}

enum EntityType {
  PAGE = 'page',
  HIGHLIGHT = 'highlight',
  LABEL = 'label',
}

const expired = (body: PubSubRequestBody): boolean => {
  const now = new Date()
  const expiredTime = new Date(body.message.publishTime)
  expiredTime.setHours(expiredTime.getHours() + 1)

  return now > expiredTime
}

const readPushSubscription = (
  req: express.Request
): { message: string | undefined; expired: boolean; subscription?: string } => {
  if (req.query.token !== process.env.PUBSUB_VERIFICATION_TOKEN) {
    console.log('query does not include valid pubsub token')
    return { message: undefined, expired: false }
  }

  // GCP PubSub sends the request as a base64 encoded string
  if (!('message' in req.body) || !('subscription' in req.body)) {
    console.log('Invalid pubsub message: message or subscription not in body')
    return { message: undefined, expired: false }
  }

  const body = req.body as PubSubRequestBody
  const message = Buffer.from(body.message.data, 'base64').toString('utf-8')

  return {
    message: message,
    expired: expired(body),
    subscription: body.subscription,
  }
}

export const getAuthToken = async (
  userId: string,
  jwtSecret: string
): Promise<string> => {
  const auth = await signToken({ uid: userId }, jwtSecret)
  return auth as string
}

const ruleEventType = (eventType: string) => {
  return `PAGE_${eventType.toUpperCase()}` as RuleEventType
}

export const ruleHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req: Request, res: Response) => {
    const apiEndpoint = process.env.REST_BACKEND_ENDPOINT
    const jwtSecret = process.env.JWT_SECRET
    if (!apiEndpoint || !jwtSecret) {
      throw new Error('REST_BACKEND_ENDPOINT or JWT_SECRET not set')
    }

    const { message: msgStr, expired, subscription } = readPushSubscription(req)

    if (!msgStr || !subscription) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      console.log('discarding expired message')
      res.status(200).send('Expired')
      return
    }

    try {
      const data = JSON.parse(msgStr) as PubSubData
      const { userId, type } = data
      if (!userId || !type) {
        console.log('No userId or type found in message')
        res.status(400).send('Bad Request')
        return
      }

      if (type !== EntityType.PAGE) {
        console.log('Not a page')
        res.status(200).send('Not Page')
        return
      }

      // get rules by calling api
      const rules = await getEnabledRules(userId, apiEndpoint, jwtSecret)
      if (!rules || rules.length === 0) {
        console.log('No rules found')
        res.status(200).send('No Rules')
        return
      }

      // subscription: 'projects/omnivore-demo/subscriptions/entityUpdated-rule'
      const eventType = subscription.match(/entity(.*)-rule/)?.[1]
      if (!eventType) {
        console.log('No event type found')
        res.status(200).send('No Event Type')
        return
      }

      const triggeredActions = await triggerActions(
        userId,
        rules,
        data,
        apiEndpoint,
        jwtSecret,
        ruleEventType(eventType)
      )
      if (triggeredActions.length === 0) {
        console.log('No actions triggered')
        res.status(200).send('No Actions')
        return
      }

      res.status(200).send('OK')
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal server error')
    }
  }
)
