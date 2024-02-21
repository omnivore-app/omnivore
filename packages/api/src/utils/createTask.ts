/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
// Imports the Google Cloud Tasks library.
import { CloudTasksClient, protos } from '@google-cloud/tasks'
import { google } from '@google-cloud/tasks/build/protos/protos'
import axios from 'axios'
import { nanoid } from 'nanoid'
import { DeepPartial } from 'typeorm'
import { v4 as uuid } from 'uuid'
import { ImportItemState } from '../entity/integration'
import { Recommendation } from '../entity/recommendation'
import { env } from '../env'
import {
  ArticleSavingRequestStatus,
  CreateLabelInput,
} from '../generated/graphql'
import { BulkActionData, BULK_ACTION_JOB_NAME } from '../jobs/bulk_action'
import { CallWebhookJobData, CALL_WEBHOOK_JOB_NAME } from '../jobs/call_webhook'
import { THUMBNAIL_JOB } from '../jobs/find_thumbnail'
import { queueRSSRefreshFeedJob } from '../jobs/rss/refreshAllFeeds'
import { TriggerRuleJobData, TRIGGER_RULE_JOB_NAME } from '../jobs/trigger_rule'
import {
  UpdateHighlightData,
  UpdateLabelsData,
  UPDATE_HIGHLIGHT_JOB,
  UPDATE_LABELS_JOB,
} from '../jobs/update_db'
import { getBackendQueue, JOB_VERSION } from '../queue-processor'
import { redisDataSource } from '../redis_data_source'
import { signFeatureToken } from '../services/features'
import { OmnivoreAuthorizationHeader } from './auth'
import { CreateTaskError } from './errors'
import { stringToHash } from './helpers'
import { logger } from './logger'
import View = google.cloud.tasks.v2.Task.View

// Instantiates a client.
const client = new CloudTasksClient()

const logError = (error: any): void => {
  if (axios.isAxiosError(error)) {
    logger.error(error.response)
  } else {
    logger.error(error)
  }
}

const createHttpTaskWithToken = async ({
  project = process.env.GOOGLE_CLOUD_PROJECT,
  queue = env.queue.name,
  location = env.queue.location,
  taskHandlerUrl = env.queue.contentFetchUrl,
  serviceAccountEmail = `${process.env.GOOGLE_CLOUD_PROJECT}@appspot.gserviceaccount.com`,
  payload,
  priority = 'high',
  scheduleTime,
  requestHeaders,
}: {
  project?: string
  queue?: string
  location?: string
  taskHandlerUrl?: string
  serviceAccountEmail?: string
  payload: unknown
  priority?: 'low' | 'high'
  scheduleTime?: number
  requestHeaders?: Record<string, string>
}): Promise<
  | [
      protos.google.cloud.tasks.v2.ITask,
      protos.google.cloud.tasks.v2.ICreateTaskRequest | undefined,
      unknown | undefined
    ]
  | null
> => {
  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !project) {
    logger.error(
      'error: attempting to create a cloud task but not running in google cloud.'
    )
    return null
  }

  // Construct the fully qualified queue name.
  if (priority === 'low') {
    queue = `${queue}-low`
  }

  const parent = client.queuePath(project, location, queue)
  // Convert message to buffer.
  let convertedPayload: string | ArrayBuffer
  try {
    convertedPayload = JSON.stringify(payload)
  } catch (error) {
    throw new CreateTaskError('Invalid payload')
  }
  const body = Buffer.from(convertedPayload).toString('base64')

  const task: protos.google.cloud.tasks.v2.ITask = {
    httpRequest: {
      httpMethod: 'POST',
      url: taskHandlerUrl,
      headers: {
        'Content-Type': 'application/json',
        ...requestHeaders,
      },
      body,
      ...(serviceAccountEmail
        ? {
            oidcToken: {
              serviceAccountEmail,
            },
          }
        : null),
    },
    scheduleTime: scheduleTime
      ? protos.google.protobuf.Timestamp.fromObject({
          seconds: scheduleTime / 1000,
          nanos: (scheduleTime % 1000) * 1e6,
        })
      : null,
  }

  try {
    return await client.createTask({ parent, task })
  } catch (error) {
    logError(error)
    return null
  }
}

export const createAppEngineTask = async ({
  project,
  queue = env.queue.name,
  location = env.queue.location,
  taskHandlerUrl = env.queue.reminderTaskHandlerUrl,
  payload,
  priority = 'high',
  scheduleTime,
}: {
  project: string
  queue?: string
  location?: string
  taskHandlerUrl?: string
  payload: unknown
  priority?: 'low' | 'high'
  scheduleTime?: number
}): Promise<string | undefined | null> => {
  // Construct the fully qualified queue name.
  if (priority === 'low') {
    queue = `${queue}-low`
  }

  const parent = client.queuePath(project, location, queue)
  const task: protos.google.cloud.tasks.v2.ITask = {
    appEngineHttpRequest: {
      httpMethod: 'POST',
      relativeUri: taskHandlerUrl,
    },
  }

  if (payload && task.appEngineHttpRequest) {
    // Convert message to buffer.
    let convertedPayload: string | ArrayBuffer
    try {
      convertedPayload = JSON.stringify(payload)
    } catch (error) {
      throw new CreateTaskError('Invalid payload')
    }

    task.appEngineHttpRequest.body =
      Buffer.from(convertedPayload).toString('base64')
  }

  if (scheduleTime) {
    // The time when the task is scheduled to be attempted.
    task.scheduleTime = {
      seconds: scheduleTime / 1000,
    }
  }

  logger.info('Sending task:')
  // Send create task request.
  const request = { parent: parent, task: task }
  const [response] = await client.createTask(request)
  const name = response.name
  logger.info(`Created task ${name}`)

  return name
}

export const getTask = async (
  taskName: string
): Promise<google.cloud.tasks.v2.ITask> => {
  // If we are in local environment
  if (env.dev.isLocal) {
    return { name: taskName } as protos.google.cloud.tasks.v2.ITask
  }

  const request: protos.google.cloud.tasks.v2.GetTaskRequest = {
    responseView: View.FULL,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON(): { [p: string]: any } {
      return {}
    },
    name: taskName,
  }

  const [response] = await client.getTask(request)

  return response
}

export const deleteTask = async (
  taskName: string
): Promise<google.protobuf.IEmpty | null> => {
  // If we are in local environment
  if (env.dev.isLocal) {
    return taskName
  }

  const request: protos.google.cloud.tasks.v2.IDeleteTaskRequest = {
    name: taskName,
  }

  try {
    const [response] = await client.deleteTask(request)
    return response
  } catch (error) {
    logError(error)
    return null
  }
}

/**
 * Enqueues the task for the article content parsing with Puppeteer by URL
 * @param url - URL address of the article to parse
 * @param userId - Id of the user authorized
 * @param saveRequestId - Id of the article_saving_request table record
 * @param priority - Priority of the task
 * @param queue - Queue name
 * @returns Name of the task created
 */
export const enqueueParseRequest = async ({
  url,
  userId,
  saveRequestId,
  priority = 'high',
  queue = env.queue.name,
  state,
  labels,
  locale,
  timezone,
  savedAt,
  publishedAt,
  folder,
  rssFeedUrl,
}: {
  url: string
  userId: string
  saveRequestId: string
  priority?: 'low' | 'high'
  queue?: string
  state?: ArticleSavingRequestStatus
  labels?: CreateLabelInput[]
  locale?: string
  timezone?: string
  savedAt?: Date
  publishedAt?: Date
  folder?: string
  rssFeedUrl?: string
}): Promise<string> => {
  const { GOOGLE_CLOUD_PROJECT } = process.env
  const payload = {
    url,
    userId,
    saveRequestId,
    state,
    labels,
    locale,
    timezone,
    savedAt,
    publishedAt,
    folder,
    rssFeedUrl,
    priority,
  }

  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !GOOGLE_CLOUD_PROJECT) {
    if (env.queue.contentFetchUrl) {
      // Calling the handler function directly.
      setTimeout(() => {
        axios.post(env.queue.contentFetchUrl, payload).catch((error) => {
          logError(error)
          logger.error(
            `Error occurred while requesting local puppeteer-parse function\nPlease, ensure your function is set up properly and running using "yarn start" from the "/pkg/gcf/puppeteer-parse" folder`
          )
        })
      }, 0)
    }
    return ''
  }

  // use GCF url for low priority tasks
  const taskHandlerUrl =
    priority === 'low'
      ? env.queue.contentFetchGCFUrl
      : env.queue.contentFetchUrl

  const createdTasks = await createHttpTaskWithToken({
    project: GOOGLE_CLOUD_PROJECT,
    payload,
    priority,
    taskHandlerUrl,
    queue,
  })
  if (!createdTasks || !createdTasks[0].name) {
    logger.error(`Unable to get the name of the task`, {
      payload,
      createdTasks,
    })
    throw new CreateTaskError(`Unable to get the name of the task`)
  }
  return createdTasks[0].name
}

export const enqueueReminder = async (
  userId: string,
  scheduleTime: number
): Promise<string> => {
  const { GOOGLE_CLOUD_PROJECT } = process.env
  const payload = {
    userId,
    scheduleTime,
  }

  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !GOOGLE_CLOUD_PROJECT) {
    return nanoid()
  }

  const createdTasks = await createHttpTaskWithToken({
    project: GOOGLE_CLOUD_PROJECT,
    payload,
    scheduleTime,
    taskHandlerUrl: env.queue.reminderTaskHandlerUrl,
  })

  if (!createdTasks || !createdTasks[0].name) {
    logger.error(`Unable to get the name of the task`, {
      payload,
      createdTasks,
    })
    throw new CreateTaskError(`Unable to get the name of the task`)
  }
  return createdTasks[0].name
}

export const enqueueTextToSpeech = async ({
  userId,
  text,
  speechId,
  voice,
  priority,
  textType = 'ssml',
  bucket = env.fileUpload.gcsUploadBucket,
  queue = 'omnivore-text-to-speech-queue',
  location = env.gcp.location,
  isUltraRealisticVoice = false,
  language,
  rate,
  featureName,
  grantedAt,
}: {
  userId: string
  speechId: string
  text: string
  voice: string
  priority: 'low' | 'high'
  bucket?: string
  textType?: 'text' | 'ssml'
  queue?: string
  location?: string
  isUltraRealisticVoice?: boolean
  language?: string
  rate?: string
  featureName?: string
  grantedAt?: Date | null
}): Promise<string> => {
  const { GOOGLE_CLOUD_PROJECT } = process.env
  const payload = {
    id: speechId,
    text,
    voice,
    bucket,
    textType,
    isUltraRealisticVoice,
    language,
    rate,
  }
  const token = signFeatureToken({ name: featureName, grantedAt }, userId)
  const taskHandlerUrl = `${env.queue.textToSpeechTaskHandlerUrl}?token=${token}`
  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !GOOGLE_CLOUD_PROJECT) {
    if (env.queue.textToSpeechTaskHandlerUrl) {
      // Calling the handler function directly.
      setTimeout(() => {
        axios.post(taskHandlerUrl, payload).catch((error) => {
          logError(error)
        })
      }, 0)
    }
    return ''
  }
  const createdTasks = await createHttpTaskWithToken({
    project: GOOGLE_CLOUD_PROJECT,
    payload,
    taskHandlerUrl,
    queue,
    location,
    priority,
  })

  if (!createdTasks || !createdTasks[0].name) {
    logger.error(`Unable to get the name of the task`, {
      payload,
      createdTasks,
    })
    throw new CreateTaskError(`Unable to get the name of the task`)
  }
  return createdTasks[0].name
}

export const enqueueRecommendation = async (
  userId: string,
  itemId: string,
  recommendation: DeepPartial<Recommendation>,
  authToken: string,
  highlightIds?: string[]
): Promise<string> => {
  const { GOOGLE_CLOUD_PROJECT } = process.env
  const payload = {
    userId,
    itemId,
    recommendation,
    highlightIds,
  }

  const headers = {
    [OmnivoreAuthorizationHeader]: authToken,
  }
  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !GOOGLE_CLOUD_PROJECT) {
    if (env.queue.recommendationTaskHandlerUrl) {
      // Calling the handler function directly.
      setTimeout(() => {
        axios
          .post(env.queue.recommendationTaskHandlerUrl, payload, {
            headers,
          })
          .catch((error) => {
            logError(error)
          })
      }, 0)
    }
    return ''
  }

  const createdTasks = await createHttpTaskWithToken({
    project: GOOGLE_CLOUD_PROJECT,
    payload,
    taskHandlerUrl: env.queue.recommendationTaskHandlerUrl,
    requestHeaders: headers,
  })

  if (!createdTasks || !createdTasks[0].name) {
    logger.error(`Unable to get the name of the task`, {
      payload,
      createdTasks,
    })
    throw new CreateTaskError(`Unable to get the name of the task`)
  }
  return createdTasks[0].name
}

export const enqueueImportFromIntegration = async (
  integrationId: string,
  integrationName: string,
  syncAt: number, // unix timestamp in milliseconds
  authToken: string,
  state: ImportItemState
): Promise<string> => {
  const { GOOGLE_CLOUD_PROJECT } = process.env
  const payload = {
    integrationId,
    integrationName,
    syncAt,
    state,
  }

  const headers = {
    [OmnivoreAuthorizationHeader]: authToken,
  }
  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !GOOGLE_CLOUD_PROJECT) {
    if (env.queue.integrationImporterUrl) {
      // Calling the handler function directly.
      setTimeout(() => {
        axios
          .post(env.queue.integrationImporterUrl, payload, {
            headers,
          })
          .catch((error) => {
            logError(error)
          })
      }, 0)
    }
    return nanoid()
  }

  const createdTasks = await createHttpTaskWithToken({
    project: GOOGLE_CLOUD_PROJECT,
    payload,
    taskHandlerUrl: env.queue.integrationImporterUrl,
    priority: 'low',
    requestHeaders: headers,
  })

  if (!createdTasks || !createdTasks[0].name) {
    logger.error(`Unable to get the name of the task`, {
      payload,
      createdTasks,
    })
    throw new CreateTaskError(`Unable to get the name of the task`)
  }
  return createdTasks[0].name
}

export const enqueueExportToIntegration = async (
  integrationId: string,
  integrationName: string,
  syncAt: number, // unix timestamp in milliseconds
  authToken: string
): Promise<string> => {
  const { GOOGLE_CLOUD_PROJECT } = process.env
  const payload = {
    integrationId,
    integrationName,
    syncAt,
  }

  const headers = {
    [OmnivoreAuthorizationHeader]: authToken,
  }
  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !GOOGLE_CLOUD_PROJECT) {
    if (env.queue.integrationExporterUrl) {
      // Calling the handler function directly.
      setTimeout(() => {
        axios
          .post(env.queue.integrationExporterUrl, payload, {
            headers,
          })
          .catch((error) => {
            logError(error)
          })
      }, 0)
    }
    return nanoid()
  }

  const createdTasks = await createHttpTaskWithToken({
    project: GOOGLE_CLOUD_PROJECT,
    payload,
    taskHandlerUrl: env.queue.integrationExporterUrl,
    priority: 'low',
    requestHeaders: headers,
  })

  if (!createdTasks || !createdTasks[0].name) {
    logger.error(`Unable to get the name of the task`, {
      payload,
      createdTasks,
    })
    throw new CreateTaskError(`Unable to get the name of the task`)
  }
  return createdTasks[0].name
}

export const enqueueThumbnailJob = async (
  userId: string,
  libraryItemId: string
) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }
  const payload = {
    userId,
    libraryItemId,
  }
  return queue.add(THUMBNAIL_JOB, payload, {
    priority: 100,
    attempts: 1,
    removeOnComplete: true,
  })
}

export interface RssSubscriptionGroup {
  url: string
  subscriptionIds: string[]
  userIds: string[]
  mostRecentItemDates: (Date | null)[]
  scheduledDates: Date[]
  checksums: (string | null)[]
  fetchContents: boolean[]
  folders: string[]
}

export const enqueueRssFeedFetch = async (
  subscriptionGroup: RssSubscriptionGroup
): Promise<string> => {
  const payload = {
    refreshContext: {
      type: 'user-added',
      refreshID: uuid(),
      startedAt: new Date().toISOString(),
    },
    subscriptionIds: subscriptionGroup.subscriptionIds,
    feedUrl: subscriptionGroup.url,
    mostRecentItemDates: subscriptionGroup.mostRecentItemDates.map(
      (timestamp) => timestamp?.getTime() || 0
    ), // unix timestamp in milliseconds
    lastFetchedChecksums: subscriptionGroup.checksums,
    scheduledTimestamps: subscriptionGroup.scheduledDates.map((timestamp) =>
      timestamp.getTime()
    ), // unix timestamp in milliseconds
    userIds: subscriptionGroup.userIds,
    fetchContents: subscriptionGroup.fetchContents,
    folders: subscriptionGroup.folders,
  }

  let jobid = `refresh-feed_${stringToHash(
    subscriptionGroup.url
  )}_${stringToHash(JSON.stringify(subscriptionGroup.userIds.sort()))}`

  if (redisDataSource.workerRedisClient) {
    let job = await queueRSSRefreshFeedJob(jobid, payload, {
      priority: 'high',
    })
    if (!job || !job.id) {
      throw 'unable to queue rss-refresh-feed-job, job did not enqueue'
    }
    return job.id
  } else {
    throw 'unable to queue rss-refresh-feed-job, redis is not configured'
  }
}

export const enqueueTriggerRuleJob = async (data: TriggerRuleJobData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(TRIGGER_RULE_JOB_NAME, data, {
    priority: 5,
    attempts: 1,
  })
}

export const enqueueWebhookJob = async (data: CallWebhookJobData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(CALL_WEBHOOK_JOB_NAME, data, {
    priority: 5,
    attempts: 1,
  })
}

export const bulkEnqueueUpdateLabels = async (data: UpdateLabelsData[]) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return []
  }

  const jobs = data.map((d) => ({
    name: UPDATE_LABELS_JOB,
    data: d,
    opts: {
      jobId: `${UPDATE_LABELS_JOB}_${d.libraryItemId}_${JOB_VERSION}`,
      attempts: 6,
      priority: 1,
      removeOnComplete: true,
      removeOnFail: true,
    },
  }))

  try {
    return queue.addBulk(jobs)
  } catch (error) {
    logger.error('error enqueuing update labels jobs', error)
    return []
  }
}

export const enqueueUpdateHighlight = async (data: UpdateHighlightData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  try {
    return queue.add(UPDATE_HIGHLIGHT_JOB, data, {
      jobId: `${UPDATE_HIGHLIGHT_JOB}_${data.libraryItemId}_${JOB_VERSION}`,
      attempts: 6,
      priority: 1,
      removeOnComplete: true,
      removeOnFail: true,
    })
  } catch (error) {
    logger.error('error enqueuing update highlight job', error)
  }
}

export const enqueueBulkAction = async (data: BulkActionData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  const jobId = `${BULK_ACTION_JOB_NAME}_${data.userId}_${JOB_VERSION}`

  try {
    return queue.add(BULK_ACTION_JOB_NAME, data, {
      attempts: 1,
      priority: 10,
      jobId, // deduplication
      removeOnComplete: true,
      removeOnFail: true,
    })
  } catch (error) {
    logger.error('error enqueuing bulk action job', error)
  }
}

export default createHttpTaskWithToken
