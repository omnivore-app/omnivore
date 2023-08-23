import { PubSub } from '@google-cloud/pubsub'
import express from 'express'
import { env } from './env'
import { ReportType } from './generated/graphql'
import { buildLogger } from './utils/logger'

const logger = buildLogger('pubsub')

const client = new PubSub()

export const createPubSubClient = (): PubsubClient => {
  const publish = (topicName: string, msg: Buffer): Promise<void> => {
    if (env.dev.isLocal) {
      logger.info(`Publishing ${topicName}`)
      return Promise.resolve()
    }

    return client
      .topic(topicName)
      .publishMessage({ data: msg })
      .catch((err) => {
        logger.error(`[PubSub] error: ${topicName}`, err)
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
    entityCreated: <T>(
      type: EntityType,
      data: T,
      userId: string
    ): Promise<void> => {
      return publish(
        'entityCreated',
        Buffer.from(JSON.stringify({ type, userId, ...data }))
      )
    },
    entityUpdated: <T>(
      type: EntityType,
      data: T,
      userId: string
    ): Promise<void> => {
      return publish(
        'entityUpdated',
        Buffer.from(JSON.stringify({ type, userId, ...data }))
      )
    },
    entityDeleted: (
      type: EntityType,
      id: string,
      userId: string
    ): Promise<void> => {
      return publish(
        'entityDeleted',
        Buffer.from(JSON.stringify({ type, id, userId }))
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

export enum EntityType {
  PAGE = 'page',
  HIGHLIGHT = 'highlight',
  LABEL = 'label',
}

export interface PubsubClient {
  userCreated: (
    userId: string,
    email: string,
    name: string,
    username: string
  ) => Promise<void>
  entityCreated: <T>(type: EntityType, data: T, userId: string) => Promise<void>
  entityUpdated: <T>(type: EntityType, data: T, userId: string) => Promise<void>
  entityDeleted: (type: EntityType, id: string, userId: string) => Promise<void>
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

export interface PubSubRequestBody {
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
  if (req.query.token !== process.env.PUBSUB_VERIFICATION_TOKEN) {
    logger.info('query does not include valid pubsub token')
    return { message: undefined, expired: false }
  }

  // GCP PubSub sends the request as a base64 encoded string
  if (!('message' in req.body)) {
    logger.info('Invalid pubsub message: message not in body')
    return { message: undefined, expired: false }
  }

  const body = req.body as PubSubRequestBody
  const message = Buffer.from(body.message.data, 'base64').toString('utf-8')

  return { message: message, expired: expired(body) }
}
