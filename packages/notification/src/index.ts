import * as Sentry from '@sentry/serverless'
import { Request, Response } from 'express'
import { sendBatchPushNotifications } from './sendNotification'
import { Message } from 'firebase-admin/lib/messaging'

interface SubscriptionData {
  attributes?: string
  data: string
}

const readPushSubscription = (req: Request): SubscriptionData | null => {
  console.debug('request query', req.body)

  if (req.query.token !== process.env.PUBSUB_VERIFICATION_TOKEN) {
    console.log('query does not include valid pubsub token')
    return null
  }

  // GCP PubSub sends the request as a base64 encoded string
  if (!('message' in req.body)) {
    console.log('Invalid pubsub message: message not in body')
    return null
  }

  const body = req.body as { message: { data: string }; attributes?: string }
  const data = Buffer.from(body.message.data, 'base64').toString('utf-8')

  return {
    data,
    attributes: body.attributes,
  }
}

const getBatchMessages = (messages: string[], tokens: string[]): Message[] => {
  const batchMessages: Message[] = []
  messages.forEach((message) => {
    tokens.forEach((token) => {
      batchMessages.push({
        token,
        notification: {
          body: message,
        },
      })
    })
  })

  return batchMessages
}

export const notification = Sentry.GCPFunction.wrapHttpFunction(
  async (req: Request, res: Response) => {
    const subscriptionData = readPushSubscription(req)
    if (!subscriptionData) {
      res.status(400).send('Invalid request')
      return
    }

    const { attributes } = subscriptionData
    if (!attributes) {
      res.status(400).send('Invalid request')
      return
    }

    const { messages, tokens } = JSON.parse(attributes) as {
      messages: string[]
      tokens: string[]
    }
    if (!messages || messages.length === 0 || !tokens || tokens.length === 0) {
      res.status(400).send('Invalid request')
      return
    }

    const batchMessages = getBatchMessages(messages, tokens)

    try {
      await sendBatchPushNotifications(batchMessages)

      res.status(200).send('OK')
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal server error')
    }
  }
)
