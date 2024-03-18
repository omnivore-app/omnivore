import { PubSub } from '@google-cloud/pubsub'
import express from 'express'
import { RuleEventType } from './entity/rule'
import { env } from './env'
import { ReportType } from './generated/graphql'
import { FeatureName, findFeatureByName } from './services/features'
import {
  enqueueAISummarizeJob,
  enqueueExportItem,
  enqueueTriggerRuleJob,
  enqueueWebhookJob,
} from './utils/createTask'
import { buildLogger } from './utils/logger'

const logger = buildLogger('pubsub')

const client = new PubSub()

export const createPubSubClient = (): PubsubClient => {
  const publish = (topicName: string, msg: Buffer): Promise<void> => {
    if (env.dev.isLocal) {
      logger.info(`Publishing ${topicName}: ${msg.toString()}`)
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
    entityCreated: async <T>(
      type: EntityType,
      data: T,
      userId: string,
      libraryItemId: string
    ): Promise<void> => {
      // queue trigger rule job
      if (type === EntityType.PAGE) {
        await enqueueTriggerRuleJob({
          userId,
          ruleEventType: RuleEventType.PageCreated,
          libraryItemId,
          data,
        })
      }
      // queue export item job
      await enqueueExportItem({
        userId,
        libraryItemIds: [libraryItemId],
      })

      await enqueueWebhookJob({
        userId,
        type,
        action: 'created',
        data,
      })

      if (await findFeatureByName(FeatureName.AISummaries, userId)) {
        await enqueueAISummarizeJob({
          userId,
          libraryItemId,
        })
      }
    },
    entityUpdated: async <T>(
      type: EntityType,
      data: T,
      userId: string,
      libraryItemId: string
    ): Promise<void> => {
      // queue trigger rule job
      if (type === EntityType.PAGE) {
        await enqueueTriggerRuleJob({
          userId,
          ruleEventType: RuleEventType.PageUpdated,
          libraryItemId,
          data,
        })
      }
      // queue export item job
      await enqueueExportItem({
        userId,
        libraryItemIds: [libraryItemId],
      })

      await enqueueWebhookJob({
        userId,
        type,
        action: 'updated',
        data,
      })
    },
    entityDeleted: async (
      type: EntityType,
      id: string,
      userId: string
    ): Promise<void> => {
      logger.info(`entityDeleted: ${type} ${id} ${userId}`)
      await Promise.resolve()
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
  entityCreated: <T>(
    type: EntityType,
    data: T,
    userId: string,
    libraryItemId: string
  ) => Promise<void>
  entityUpdated: <T>(
    type: EntityType,
    data: T,
    userId: string,
    libraryItemId: string
  ) => Promise<void>
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
