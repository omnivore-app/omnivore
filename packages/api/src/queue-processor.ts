/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  ConnectionOptions,
  Job,
  JobState,
  JobType,
  Queue,
  QueueEvents,
  Worker,
} from 'bullmq'
import express, { Express } from 'express'
import client from 'prom-client'
import { appDataSource } from './data_source'
import { env } from './env'
import { TaskState } from './generated/graphql'
import { aiSummarize, AI_SUMMARIZE_JOB_NAME } from './jobs/ai-summarize'
import { createDigest, CREATE_DIGEST_JOB } from './jobs/ai/create_digest'
import { bulkAction, BULK_ACTION_JOB_NAME } from './jobs/bulk_action'
import { callWebhook, CALL_WEBHOOK_JOB_NAME } from './jobs/call_webhook'
import {
  confirmEmailJob,
  CONFIRM_EMAIL_JOB,
  forwardEmailJob,
  FORWARD_EMAIL_JOB,
  saveAttachmentJob,
  saveNewsletterJob,
  SAVE_ATTACHMENT_JOB,
  SAVE_NEWSLETTER_JOB,
} from './jobs/email/inbound_emails'
import { sendEmailJob, SEND_EMAIL_JOB } from './jobs/email/send_email'
import {
  expireFoldersJob,
  EXPIRE_FOLDERS_JOB_NAME,
} from './jobs/expire_folders'
import { exportJob, EXPORT_JOB_NAME } from './jobs/export'
import { findThumbnail, THUMBNAIL_JOB } from './jobs/find_thumbnail'
import {
  generatePreviewContent,
  GENERATE_PREVIEW_CONTENT_JOB,
} from './jobs/generate_preview_content'
import {
  exportAllItems,
  EXPORT_ALL_ITEMS_JOB_NAME,
} from './jobs/integration/export_all_items'
import {
  exportItem,
  EXPORT_ITEM_JOB_NAME,
} from './jobs/integration/export_item'
import {
  processYouTubeTranscript,
  processYouTubeVideo,
  PROCESS_YOUTUBE_TRANSCRIPT_JOB_NAME,
  PROCESS_YOUTUBE_VIDEO_JOB_NAME,
} from './jobs/process-youtube-video'
import { pruneTrashJob, PRUNE_TRASH_JOB } from './jobs/prune_trash'
import {
  REFRESH_ALL_FEEDS_JOB_NAME,
  refreshAllFeeds,
} from './jobs/rss/refreshAllFeeds'
import { refreshFeed } from './jobs/rss/refreshFeed'
import { savePageJob } from './jobs/save_page'
import {
  scoreLibraryItem,
  SCORE_LIBRARY_ITEM_JOB,
} from './jobs/score_library_item'
import {
  syncReadPositionsJob,
  SYNC_READ_POSITIONS_JOB_NAME,
} from './jobs/sync_read_positions'
import { triggerRule, TRIGGER_RULE_JOB_NAME } from './jobs/trigger_rule'
import {
  updateHighlight,
  updateLabels,
  UPDATE_HIGHLIGHT_JOB,
  UPDATE_LABELS_JOB,
} from './jobs/update_db'
import { updateHome, UPDATE_HOME_JOB } from './jobs/update_home'
import { updatePDFContentJob } from './jobs/update_pdf_content'
import { uploadContentJob, UPLOAD_CONTENT_JOB } from './jobs/upload_content'
import { getMetrics, registerMetric } from './prometheus'
import { redisDataSource } from './redis_data_source'
import { CACHED_READING_POSITION_PREFIX } from './services/cached_reading_position'
import { getJobPriority } from './utils/createTask'
import { logger } from './utils/logger'

export const BACKEND_QUEUE_NAME = 'omnivore-backend-queue'
export const CONTENT_FETCH_QUEUE = 'omnivore-content-fetch-queue'

export const JOB_VERSION = 'v001'

const jobLatency = new client.Histogram({
  name: 'omnivore_job_latency',
  help: 'Latency of jobs in the queue',
  labelNames: ['job_name'],
  buckets: [0, 1, 5, 10, 50, 100, 500],
})

registerMetric(jobLatency)

export const getQueue = async (
  name = BACKEND_QUEUE_NAME
): Promise<Queue | undefined> => {
  if (!redisDataSource.workerRedisClient) {
    throw new Error('Can not create queues, redis is not initialized')
  }

  const backendQueue = new Queue(name, {
    connection: redisDataSource.workerRedisClient,
    defaultJobOptions: {
      backoff: {
        type: 'exponential',
        delay: 2000, // 2 seconds
      },
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
      },
      removeOnFail: {
        age: 24 * 3600, // keep up to 1 day
      },
    },
  })
  await backendQueue.waitUntilReady()
  return backendQueue
}

export const createJobId = (jobName: string, userId: string) =>
  `${jobName}_${userId}_${JOB_VERSION}`

export const getJob = async (jobId: string, queueName?: string) => {
  const queue = await getQueue(queueName)
  if (!queue) {
    return
  }
  return queue.getJob(jobId)
}

export const jobStateToTaskState = (
  jobState: JobState | 'unknown'
): TaskState => {
  switch (jobState) {
    case 'completed':
      return TaskState.Succeeded
    case 'failed':
      return TaskState.Failed
    case 'active':
      return TaskState.Running
    case 'delayed':
      return TaskState.Pending
    case 'waiting':
      return TaskState.Pending
    default:
      return TaskState.Pending
  }
}

export const createWorker = (connection: ConnectionOptions) =>
  new Worker(
    BACKEND_QUEUE_NAME,
    async (job: Job) => {
      const executeJob = async (job: Job) => {
        switch (job.name) {
          case 'refresh-all-feeds': {
            const queue = await getQueue()
            const counts = await queue?.getJobCounts('prioritized')
            if (counts && counts.wait > 1000) {
              return
            }
            return await refreshAllFeeds(appDataSource)
          }
          case 'refresh-feed': {
            return await refreshFeed(job.data)
          }
          case 'save-page': {
            return savePageJob(job.data, job.attemptsMade)
          }
          // case 'update-pdf-content': {
          //   return updatePDFContentJob(job.data)
          // }
          case THUMBNAIL_JOB:
            return findThumbnail(job.data)
          case TRIGGER_RULE_JOB_NAME:
            return triggerRule(job.data)
          case UPDATE_LABELS_JOB:
            return updateLabels(job.data)
          case UPDATE_HIGHLIGHT_JOB:
            return updateHighlight(job.data)
          case SYNC_READ_POSITIONS_JOB_NAME:
            return syncReadPositionsJob(job.data)
          case BULK_ACTION_JOB_NAME:
            return bulkAction(job.data)
          case CALL_WEBHOOK_JOB_NAME:
            return callWebhook(job.data)
          case EXPORT_ITEM_JOB_NAME:
            return exportItem(job.data)
          // case AI_SUMMARIZE_JOB_NAME:
          //   return aiSummarize(job.data)
          // case PROCESS_YOUTUBE_VIDEO_JOB_NAME:
          //   return processYouTubeVideo(job.data)
          // case PROCESS_YOUTUBE_TRANSCRIPT_JOB_NAME:
          //   return processYouTubeTranscript(job.data)
          case EXPORT_ALL_ITEMS_JOB_NAME:
            return exportAllItems(job.data)
          case SEND_EMAIL_JOB:
            return sendEmailJob(job.data)
          case CONFIRM_EMAIL_JOB:
            return confirmEmailJob(job.data)
          case SAVE_ATTACHMENT_JOB:
            return saveAttachmentJob(job.data)
          case SAVE_NEWSLETTER_JOB:
            return saveNewsletterJob(job.data)
          case FORWARD_EMAIL_JOB:
            return forwardEmailJob(job.data)
          // case CREATE_DIGEST_JOB:
          //   return createDigest(job.data)
          case UPLOAD_CONTENT_JOB:
            return uploadContentJob(job.data)
          // case UPDATE_HOME_JOB:
          //   return updateHome(job.data)
          // case SCORE_LIBRARY_ITEM_JOB:
          //   return scoreLibraryItem(job.data)
          case GENERATE_PREVIEW_CONTENT_JOB:
            return generatePreviewContent(job.data)
          case PRUNE_TRASH_JOB:
            return pruneTrashJob(job.data)
          case EXPIRE_FOLDERS_JOB_NAME:
            return expireFoldersJob()
          case EXPORT_JOB_NAME:
            return exportJob(job.data)
          default:
            logger.warning(`[queue-processor] unhandled job: ${job.name}`)
        }
      }

      const end = jobLatency.startTimer({ job_name: job.name })
      await executeJob(job)
      end()
    },
    {
      connection,
      autorun: true, // start processing jobs immediately
      lockDuration: 60_000, // 1 minute
      concurrency: 2,
    }
  )

const setupCronJobs = async () => {
  const queue = await getQueue()
  if (!queue) {
    logger.error('Unable to setup cron jobs. Queue is not available.')
    return
  }

  await queue.add(
    SYNC_READ_POSITIONS_JOB_NAME,
    {},
    {
      priority: getJobPriority(SYNC_READ_POSITIONS_JOB_NAME),
      repeat: {
        every: 60_000,
      },
    }
  )

  await queue.add(
    REFRESH_ALL_FEEDS_JOB_NAME,
    {},
    {
      priority: getJobPriority(REFRESH_ALL_FEEDS_JOB_NAME),
      repeat: {
        every: 14_400_000, // 4 Hours
      },
    }
  )
}

const main = async () => {
  console.log('[queue-processor]: starting queue processor')

  const app: Express = express()
  const port = process.env.PORT || 3002

  redisDataSource.setOptions({
    cache: env.redis.cache,
    mq: env.redis.mq,
  })

  // respond healthy to auto-scaler.
  app.get('/_ah/health', (req, res) => res.sendStatus(200))

  app.get('/lifecycle/prestop', async (req, res) => {
    logger.info('prestop lifecycle hook called.')
    await worker.close()
    res.sendStatus(200)
  })

  app.get('/metrics', async (_, res) => {
    const queue = await getQueue()
    if (!queue) {
      res.sendStatus(400)
      return
    }

    let output = ''
    const jobsTypes: JobType[] = [
      'active',
      'failed',
      'completed',
      'prioritized',
    ]
    const counts = await queue.getJobCounts(...jobsTypes)

    jobsTypes.forEach((metric, idx) => {
      output += `# TYPE omnivore_queue_messages_${metric} gauge\n`
      output += `omnivore_queue_messages_${metric}{queue="${BACKEND_QUEUE_NAME}"} ${counts[metric]}\n`
    })

    if (redisDataSource.redisClient) {
      // Add read-position count, if its more than 10K items just denote
      // 10_001. As this should never occur and means there is some
      // other serious issue occurring.
      const [cursor, batch] = await redisDataSource.redisClient.scan(
        0,
        'MATCH',
        `${CACHED_READING_POSITION_PREFIX}:*`,
        'COUNT',
        10_000
      )
      if (cursor != '0') {
        output += `# TYPE omnivore_read_position_messages gauge\n`
        output += `omnivore_read_position_messages{queue="${BACKEND_QUEUE_NAME}"} ${10_001}\n`
      } else if (batch) {
        output += `# TYPE omnivore_read_position_messages gauge\n`
        output += `omnivore_read_position_messages{} ${batch.length}\n`
      }
    }

    // Export the age of the oldest prioritized job in the queue
    const oldestJobs = await queue.getJobs(['prioritized'], 0, 1, true)
    if (oldestJobs.length > 0) {
      const currentTime = Date.now()
      const ageInSeconds = (currentTime - oldestJobs[0].timestamp) / 1000
      output += `# TYPE omnivore_queue_messages_oldest_job_age_seconds gauge\n`
      output += `omnivore_queue_messages_oldest_job_age_seconds{queue="${BACKEND_QUEUE_NAME}"} ${ageInSeconds}\n`
    } else {
      output += `# TYPE omnivore_queue_messages_oldest_job_age_seconds gauge\n`
      output += `omnivore_queue_messages_oldest_job_age_seconds{queue="${BACKEND_QUEUE_NAME}"} ${0}\n`
    }

    const metrics = await getMetrics()

    res
      .status(200)
      .setHeader('Content-Type', 'text/plain')
      .send(output + metrics)
  })

  const server = app.listen(port, () => {
    console.log(`[queue-processor]: started`)
  })

  // This is done after all the setup so it can access the
  // environment that was loaded from GCP
  await appDataSource.initialize()
  await redisDataSource.initialize()

  const redisClient = redisDataSource.redisClient
  const workerRedisClient = redisDataSource.workerRedisClient
  if (!workerRedisClient || !redisClient) {
    throw '[queue-processor] error redis is not initialized'
  }

  const worker = createWorker(workerRedisClient)

  await setupCronJobs()

  workerRedisClient.on('error', (error) => {
    console.trace('[queue-processor]: redis worker error', { error })
  })

  redisClient.on('error', (error) => {
    console.trace('[queue-processor]: redis error', { error })
  })

  const gracefulShutdown = async (signal: string) => {
    console.log(`[queue-processor]: Received ${signal}, closing server...`)
    await new Promise<void>((resolve) => {
      server.close((err) => {
        console.log('[queue-processor]: Express server closed')
        if (err) {
          console.log('[queue-processor]: error stopping server', { err })
        }

        resolve()
      })
    })
    await worker.close()
    console.log('[queue-processor]: Worker closed')

    await redisDataSource.shutdown()
    console.log('[queue-processor]: Redis connection closed')

    await appDataSource.destroy()
    console.log('[queue-processor]: DB connection closed')

    process.exit(0)
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

  process.on('uncaughtException', function (err) {
    // Handle the error safely
    logger.error('Uncaught exception', err)
  })

  process.on('unhandledRejection', (reason, promise) => {
    // Handle the error safely
    logger.error('Unhandled Rejection at: Promise', { promise, reason })
  })
}

// only call main if the file was called from the CLI and wasn't required from another module
if (require.main === module) {
  main().catch((e) => console.error(e))
}
