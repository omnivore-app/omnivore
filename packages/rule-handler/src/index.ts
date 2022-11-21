import * as Sentry from '@sentry/serverless'
import express, { Request, Response } from 'express'
import * as dotenv from 'dotenv'
import { closeDBConnection, createDBConnection, getRepository } from './db'
import { Rules } from './entity/rules'
import { triggerActions } from './rule' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config()

interface PubSubRequestMessage {
  data: string
  publishTime: string
}

interface PubSubRequestBody {
  message: PubSubRequestMessage
}

export interface PubSubData {
  subscription: string
  userId: string
  type: EntityType
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
): { message: string | undefined; expired: boolean } => {
  console.debug('request query', req.body)

  if (req.query.token !== process.env.PUBSUB_VERIFICATION_TOKEN) {
    console.log('query does not include valid pubsub token')
    return { message: undefined, expired: false }
  }

  // GCP PubSub sends the request as a base64 encoded string
  if (!('message' in req.body)) {
    console.log('Invalid pubsub message: message not in body')
    return { message: undefined, expired: false }
  }

  const body = req.body as PubSubRequestBody
  const message = Buffer.from(body.message.data, 'base64').toString('utf-8')

  return { message: message, expired: expired(body) }
}

export const ruleHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req: Request, res: Response) => {
    const { message: msgStr, expired } = readPushSubscription(req)

    if (!msgStr) {
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
        console.log('Not a page update')
        res.status(200).send('Not Page')
        return
      }

      await createDBConnection()

      const rules = await getRepository(Rules).findBy({
        user: { id: userId },
        enabled: true,
      })

      await triggerActions(userId, rules, data)

      await closeDBConnection()

      res.status(200).send('OK')
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal server error')
    }
  }
)
