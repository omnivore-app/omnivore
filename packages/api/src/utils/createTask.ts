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
import { FetchContentType } from '../entity/subscription'
import { env } from '../env'
import {
  ArticleSavingRequestStatus,
  CreateLabelInput,
  TaskState,
} from '../generated/graphql'
import { AISummarizeJobData, AI_SUMMARIZE_JOB_NAME } from '../jobs/ai-summarize'
import {
  CreateDigestData,
  CreateDigestJobResponse,
  CreateDigestJobSchedule,
  CREATE_DIGEST_JOB,
  CRON_PATTERNS,
  getCronPattern,
} from '../jobs/ai/create_digest'
import { BulkActionData, BULK_ACTION_JOB_NAME } from '../jobs/bulk_action'
import { CallWebhookJobData, CALL_WEBHOOK_JOB_NAME } from '../jobs/call_webhook'
import { SendEmailJobData, SEND_EMAIL_JOB } from '../jobs/email/send_email'
import { EXPIRE_FOLDERS_JOB_NAME } from '../jobs/expire_folders'
import { THUMBNAIL_JOB } from '../jobs/find_thumbnail'
import { GENERATE_PREVIEW_CONTENT_JOB } from '../jobs/generate_preview_content'
import { EXPORT_ALL_ITEMS_JOB_NAME } from '../jobs/integration/export_all_items'
import {
  ExportItemJobData,
  EXPORT_ITEM_JOB_NAME,
} from '../jobs/integration/export_item'
import {
  ProcessYouTubeTranscriptJobData,
  ProcessYouTubeVideoJobData,
  PROCESS_YOUTUBE_TRANSCRIPT_JOB_NAME,
  PROCESS_YOUTUBE_VIDEO_JOB_NAME,
} from '../jobs/process-youtube-video'
import { PRUNE_TRASH_JOB } from '../jobs/prune_trash'
import {
  queueRSSRefreshFeedJob,
  REFRESH_ALL_FEEDS_JOB_NAME,
  REFRESH_FEED_JOB_NAME,
} from '../jobs/rss/refreshAllFeeds'
import {
  ScoreLibraryItemJobData,
  SCORE_LIBRARY_ITEM_JOB,
} from '../jobs/score_library_item'
import { SYNC_READ_POSITIONS_JOB_NAME } from '../jobs/sync_read_positions'
import { TriggerRuleJobData, TRIGGER_RULE_JOB_NAME } from '../jobs/trigger_rule'
import {
  UpdateHighlightData,
  UpdateLabelsData,
  UPDATE_HIGHLIGHT_JOB,
  UPDATE_LABELS_JOB,
} from '../jobs/update_db'
import { UpdateHomeJobData, UPDATE_HOME_JOB } from '../jobs/update_home'
import {
  UploadContentJobData,
  UPLOAD_CONTENT_JOB,
} from '../jobs/upload_content'
import { getBackendQueue, JOB_VERSION } from '../queue-processor'
import { redisDataSource } from '../redis_data_source'
import { writeDigest } from '../services/digest'
import { signFeatureToken } from '../services/features'
import { OmnivoreAuthorizationHeader } from './auth'
import { CreateTaskError } from './errors'
import { stringToHash } from './helpers'
import { logError, logger } from './logger'
import View = google.cloud.tasks.v2.Task.View

// Instantiates a client.
const client = new CloudTasksClient()

/**
 * we want to prioritized jobs by the expected time to complete
 * lower number means higher priority
 * priority 1: jobs that are expected to run immediately
 * priority 5: jobs that are expected to run in less than 10 seconds
 * priority 10: jobs that are expected to run in less than 1 minute
 * priority 50: jobs that are expected to run in less than 30 minutes
 * priority 100: jobs that are expected to run in less than 1 hour
 **/
export const getJobPriority = (jobName: string): number => {
  switch (jobName) {
    case UPDATE_LABELS_JOB:
    case UPDATE_HIGHLIGHT_JOB:
    case SYNC_READ_POSITIONS_JOB_NAME:
    case SEND_EMAIL_JOB:
    case UPDATE_HOME_JOB:
      return 1
    case TRIGGER_RULE_JOB_NAME:
    case CALL_WEBHOOK_JOB_NAME:
    case AI_SUMMARIZE_JOB_NAME:
    case PROCESS_YOUTUBE_VIDEO_JOB_NAME:
      return 5
    case BULK_ACTION_JOB_NAME:
    case `${REFRESH_FEED_JOB_NAME}_high`:
    case PROCESS_YOUTUBE_TRANSCRIPT_JOB_NAME:
    case UPLOAD_CONTENT_JOB:
    case SCORE_LIBRARY_ITEM_JOB:
      return 10
    case `${REFRESH_FEED_JOB_NAME}_low`:
    case EXPORT_ITEM_JOB_NAME:
    case CREATE_DIGEST_JOB:
      return 50
    case EXPORT_ALL_ITEMS_JOB_NAME:
    case REFRESH_ALL_FEEDS_JOB_NAME:
    case THUMBNAIL_JOB:
    case GENERATE_PREVIEW_CONTENT_JOB:
    case PRUNE_TRASH_JOB:
    case EXPIRE_FOLDERS_JOB_NAME:
      return 100

    default:
      logger.error(`unknown job name: ${jobName}`)
      return 1
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
    setTimeout(() => {
      axios
        .post(taskHandlerUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            ...requestHeaders,
          },
        })
        .catch((error) => {
          logError(error)
        })
    })
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
  userId: string
) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }
  const payload = {
    userId,
    integrationId,
  }
  return queue.add(EXPORT_ALL_ITEMS_JOB_NAME, payload, {
    priority: getJobPriority(EXPORT_ALL_ITEMS_JOB_NAME),
    attempts: 1,
  })
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
    priority: getJobPriority(THUMBNAIL_JOB),
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
  fetchContentTypes: FetchContentType[]
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
    fetchContentTypes: subscriptionGroup.fetchContentTypes,
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
    priority: getJobPriority(TRIGGER_RULE_JOB_NAME),
    attempts: 1,
  })
}

export const enqueueWebhookJob = async (data: CallWebhookJobData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(CALL_WEBHOOK_JOB_NAME, data, {
    priority: getJobPriority(CALL_WEBHOOK_JOB_NAME),
    attempts: 1,
  })
}

export const enqueueAISummarizeJob = async (data: AISummarizeJobData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(AI_SUMMARIZE_JOB_NAME, data, {
    priority: getJobPriority(AI_SUMMARIZE_JOB_NAME),
    attempts: 3,
  })
}

export const enqueueProcessYouTubeVideo = async (
  data: ProcessYouTubeVideoJobData
) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(PROCESS_YOUTUBE_VIDEO_JOB_NAME, data, {
    priority: getJobPriority(PROCESS_YOUTUBE_VIDEO_JOB_NAME),
    attempts: 3,
    delay: 2000,
  })
}

export const enqueueProcessYouTubeTranscript = async (
  data: ProcessYouTubeTranscriptJobData
) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(PROCESS_YOUTUBE_TRANSCRIPT_JOB_NAME, data, {
    priority: getJobPriority(PROCESS_YOUTUBE_TRANSCRIPT_JOB_NAME),
    attempts: 3,
    delay: 2000,
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
      priority: getJobPriority(UPDATE_LABELS_JOB),
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
      priority: getJobPriority(UPDATE_HIGHLIGHT_JOB),
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
      priority: getJobPriority(BULK_ACTION_JOB_NAME),
      jobId, // deduplication
      removeOnComplete: true,
      removeOnFail: true,
    })
  } catch (error) {
    logger.error('error enqueuing bulk action job', error)
  }
}

export const enqueueExportItem = async (jobData: ExportItemJobData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(EXPORT_ITEM_JOB_NAME, jobData, {
    attempts: 3,
    priority: getJobPriority(EXPORT_ITEM_JOB_NAME),
    backoff: {
      type: 'exponential',
      delay: 10000, // 10 seconds
    },
  })
}

export const enqueueSendEmail = async (jobData: SendEmailJobData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(SEND_EMAIL_JOB, jobData, {
    attempts: 1, // only try once
    priority: getJobPriority(SEND_EMAIL_JOB),
  })
}

export const scheduledDigestJobOptions = (
  schedule: CreateDigestJobSchedule
) => ({
  pattern: getCronPattern(schedule),
  tz: 'UTC',
})

export const removeDigestJobs = async (userId: string) => {
  const queue = await getBackendQueue()
  if (!queue) {
    throw new Error('No queue found')
  }

  const jobId = `${CREATE_DIGEST_JOB}_${userId}`

  // remove existing one-time job if any
  const job = await queue.getJob(jobId)
  if (job) {
    await job.remove()
    logger.info('existing job removed', { jobId })
  }

  // remove existing repeated job if any
  await Promise.all(
    Object.keys(CRON_PATTERNS).map((key) =>
      queue.removeRepeatable(
        CREATE_DIGEST_JOB,
        scheduledDigestJobOptions(key as CreateDigestJobSchedule),
        jobId
      )
    )
  )
}

export const enqueueCreateDigest = async (
  data: CreateDigestData,
  schedule?: CreateDigestJobSchedule
): Promise<CreateDigestJobResponse> => {
  const queue = await getBackendQueue()
  if (!queue) {
    throw new Error('No queue found')
  }

  // generate unique id for the digest
  data.id = uuid()
  // enqueue create digest job immediately
  const jobId = `${CREATE_DIGEST_JOB}_${data.userId}`
  const job = await queue.add(CREATE_DIGEST_JOB, data, {
    jobId, // dedupe by job id
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 1,
    priority: getJobPriority(CREATE_DIGEST_JOB),
  })

  if (!job || !job.id) {
    logger.error('Error while enqueuing create digest job', data)
    throw new Error('Error while enqueuing create digest job')
  }

  logger.info('create digest job enqueued', { jobId })

  const digest = {
    id: data.id,
    jobState: TaskState.Running,
  }

  // update digest job state in redis
  await writeDigest(data.userId, digest)

  if (schedule) {
    // schedule repeated job
    // delete the digest id to avoid duplication
    delete data.id

    const job = await queue.add(CREATE_DIGEST_JOB, data, {
      attempts: 1,
      priority: getJobPriority(CREATE_DIGEST_JOB),
      repeat: {
        ...scheduledDigestJobOptions(schedule), // cron parser options (tz, etc.)
        jobId,
      },
    })

    if (!job || !job.id) {
      logger.error('Error while scheduling create digest job', data)
      throw new Error('Error while scheduling create digest job')
    }

    logger.info('create digest job scheduled', { jobId, schedule })
  }

  return {
    jobId: digest.id,
    jobState: digest.jobState,
  }
}

export const enqueueBulkUploadContentJob = async (
  data: UploadContentJobData[]
) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return ''
  }

  const jobs = data.map((d) => ({
    name: UPLOAD_CONTENT_JOB,
    data: d,
    opts: {
      jobId: `${UPLOAD_CONTENT_JOB}_${d.filePath}_${JOB_VERSION}`, // dedupe by job id
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3,
      priority: getJobPriority(UPLOAD_CONTENT_JOB),
    },
  }))

  return queue.addBulk(jobs)
}

export const updateHomeJobId = (userId: string) =>
  `${UPDATE_HOME_JOB}_${userId}_${JOB_VERSION}`

export const enqueueUpdateHomeJob = async (data: UpdateHomeJobData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(UPDATE_HOME_JOB, data, {
    jobId: updateHomeJobId(data.userId),
    removeOnComplete: true,
    removeOnFail: true,
    priority: getJobPriority(UPDATE_HOME_JOB),
    attempts: 3,
  })
}

export const updateScoreJobId = (userId: string) =>
  `${SCORE_LIBRARY_ITEM_JOB}_${userId}_${JOB_VERSION}`

export const enqueueScoreJob = async (data: ScoreLibraryItemJobData) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(SCORE_LIBRARY_ITEM_JOB, data, {
    jobId: updateScoreJobId(data.userId),
    removeOnComplete: true,
    removeOnFail: true,
    priority: getJobPriority(SCORE_LIBRARY_ITEM_JOB),
    attempts: 3,
  })
}

export const enqueueGeneratePreviewContentJob = async (
  libraryItemId: string,
  userId: string
) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(
    GENERATE_PREVIEW_CONTENT_JOB,
    {
      libraryItemId,
      userId,
    },
    {
      jobId: `${GENERATE_PREVIEW_CONTENT_JOB}_${libraryItemId}_${JOB_VERSION}`,
      removeOnComplete: true,
      removeOnFail: true,
      priority: getJobPriority(GENERATE_PREVIEW_CONTENT_JOB),
      attempts: 3,
    }
  )
}

export const enqueuePruneTrashJob = async (numDays: number) => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(
    PRUNE_TRASH_JOB,
    { numDays },
    {
      jobId: `${PRUNE_TRASH_JOB}_${numDays}_${JOB_VERSION}`,
      removeOnComplete: true,
      removeOnFail: true,
      priority: getJobPriority(PRUNE_TRASH_JOB),
      attempts: 3,
    }
  )
}

export const enqueueExpireFoldersJob = async () => {
  const queue = await getBackendQueue()
  if (!queue) {
    return undefined
  }

  return queue.add(
    EXPIRE_FOLDERS_JOB_NAME,
    {},
    {
      jobId: `${EXPIRE_FOLDERS_JOB_NAME}_${JOB_VERSION}`,
      removeOnComplete: true,
      removeOnFail: true,
      priority: getJobPriority(EXPIRE_FOLDERS_JOB_NAME),
      attempts: 3,
    }
  )
}

export default createHttpTaskWithToken
