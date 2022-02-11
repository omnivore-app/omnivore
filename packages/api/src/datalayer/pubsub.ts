import { PubSub } from '@google-cloud/pubsub'
import { env } from '../env'
import { ReportType } from '../generated/graphql'
import express from 'express'

export const createPubSubClient = (): PubsubClient => {
  const client = new PubSub()

  const publish = (topicName: string, msg: Buffer): Promise<void> => {
    if (env.dev.isLocal) {
      console.log(`Publishing ${topicName}`)
      return Promise.resolve()
    }

    console.log(`Publishing ${topicName}`, msg)
    return client
      .topic(topicName)
      .publish(msg)
      .catch((err) => {
        console.error(`[PubSub] error: ${topicName}`, err)
      })
      .then(() => {
        return Promise.resolve()
      })
  }

  return {
    userCreated: (
      userId: string,
      email: string,
      name: string,
      username: string
    ): Promise<void> => {
      return publish(
        'userCreated',
        Buffer.from(JSON.stringify({ userId, email, name, username }))
      )
    },
    pageSaved: (
      userId: string,
      url: string,
      content: string
    ): Promise<void> => {
      return publish(
        'pageSaved',
        Buffer.from(JSON.stringify({ userId, url, content }))
      )
    },
    pageCreated: (
      userId: string | undefined,
      url: string,
      content: string
    ): Promise<void> => {
      return publish(
        'pageCreated',
        Buffer.from(JSON.stringify({ userId, url, content }))
      )
    },
    reportSubmitted: (
      submitterId: string,
      itemUrl: string,
      reportType: ReportType[],
      reportComment: string
    ): Promise<void> => {
      return publish(
        'reportSubmitted',
        Buffer.from(
          JSON.stringify({ submitterId, itemUrl, reportType, reportComment })
        )
      )
    },
  }
}

export interface PubsubClient {
  userCreated: (
    userId: string,
    email: string,
    name: string,
    username: string
  ) => Promise<void>
  pageCreated: (userId: string, url: string, content: string) => Promise<void>
  pageSaved: (userId: string, url: string, content: string) => Promise<void>
  reportSubmitted(
    submitterId: string | undefined,
    itemUrl: string,
    reportType: ReportType[],
    reportComment: string
  ): Promise<void>
}

interface PubSubRequestMessage {
  data: string
  publishTime: string
}

interface PubSubRequestBody {
  message: PubSubRequestMessage
}

const expired = (body: PubSubRequestBody): boolean => {
  const now = new Date()
  const expiredTime = new Date(body.message.publishTime)
  expiredTime.setHours(expiredTime.getHours() + 1)

  return now > expiredTime
}

export const readPushSubscription = (
  req: express.Request
): { message: string | undefined; expired: boolean } => {
  console.log('request query', req.body)
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
