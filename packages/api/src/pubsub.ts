import { PubSub } from '@google-cloud/pubsub'
import express from 'express'
import { RuleEventType } from './entity/rule'
import { env } from './env'
import { ReportType } from './generated/graphql'
import {
  enqueueGeneratePreviewContentJob,
  enqueueProcessYouTubeVideo,
  enqueueScoreJob,
  enqueueThumbnailJob,
  enqueueTriggerRuleJob,
} from './utils/createTask'
import { logger } from './utils/logger'
import { isYouTubeVideoURL } from './utils/youtube'

export type EntityEvent = { id: string }

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
    entityCreated: async <T extends EntityEvent>(
      type: EntityType,
      data: T,
      userId: string
    ): Promise<void> => {
      // queue trigger rule job
      await enqueueTriggerRuleJob({
        ruleEventType: `${type.toUpperCase()}_CREATED` as RuleEventType,
        data,
        userId,
      })

      if (type === EntityType.ITEM) {
        // if (await findGrantedFeatureByName(FeatureName.AISummaries, userId)) {
        // await enqueueAISummarizeJob({
        //   userId,
        //   libraryItemId,
        // })
        // }

        const isItemWithURL = (data: any): data is { originalUrl: string } => {
          return 'originalUrl' in data
        }

        if (isItemWithURL(data) && isYouTubeVideoURL(data['originalUrl'])) {
          await enqueueProcessYouTubeVideo({
            userId,
            libraryItemId: data.id,
          })
        }

        await enqueueScoreJob({
          userId,
          libraryItemId: data.id,
        })

        const hasThumbnail = (
          data: any
        ): data is { thumbnail: string | null } => {
          return 'thumbnail' in data
        }

        // we don't want to create thumbnail for imported pages and pages that already have thumbnail
        if (!hasThumbnail(data) || !data.thumbnail) {
          try {
            // create a task to update thumbnail and pre-cache all images
            const job = await enqueueThumbnailJob(userId, data.id)
            logger.info('Thumbnail job created', { id: job?.id })
          } catch (e) {
            logger.error('Failed to enqueue thumbnail job', e)
          }
        }

        const hasPreviewContent = (
          data: any
        ): data is { previewContent: string | null } => {
          return 'previewContent' in data
        }

        // generate preview content if it is less than 180 characters
        if (
          !hasPreviewContent(data) ||
          (data.previewContent && data.previewContent.length < 180)
        ) {
          try {
            const job = await enqueueGeneratePreviewContentJob(data.id, userId)
            logger.info('Generate preview job created', { id: job?.id })
          } catch (e) {
            logger.error('Failed to enqueue generate preview job', e)
          }
        }
      }
    },
    entityUpdated: async <T extends EntityEvent>(
      type: EntityType,
      data: T,
      userId: string
    ): Promise<void> => {
      // queue trigger rule job
      await enqueueTriggerRuleJob({
        userId,
        ruleEventType: `${type.toUpperCase()}_UPDATED` as RuleEventType,
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
  ITEM = 'PAGE',
  HIGHLIGHT = 'HIGHLIGHT',
  LABEL = 'LABEL',
  RSS_FEED = 'FEED',
}

export interface PubsubClient {
  userCreated: (
    userId: string,
    email: string,
    name: string,
    username: string
  ) => Promise<void>
  entityCreated: <T extends EntityEvent>(
    type: EntityType,
    data: T,
    userId: string
  ) => Promise<void>
  entityUpdated: <T extends EntityEvent>(
    type: EntityType,
    data: T,
    userId: string
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
