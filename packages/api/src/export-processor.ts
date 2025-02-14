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
import { refreshAllFeeds } from './jobs/rss/refreshAllFeeds'
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

import { redisDataSource } from './redis_data_source'
import { CACHED_READING_POSITION_PREFIX } from './services/cached_reading_position'
import { logger } from './utils/logger'
import { getQueue } from './queue-processor'

export const EXPORT_QUEUE_NAME =
  process.env['EXPORT_QUEUE_NAME'] ?? 'omnivore-export-queue'

export const createWorker = (connection: ConnectionOptions) =>
  new Worker(
    EXPORT_QUEUE_NAME,
    async (job: Job) => {
      const executeJob = async (job: Job) => {
        switch (job.name) {
          case EXPORT_JOB_NAME:
            return exportJob(job.data)
          default:
            logger.warning(`[export-processor] unhandled job: ${job.name}`)
        }
      }

      await executeJob(job)
    },
    {
      connection,
      autorun: true, // start processing jobs immediately
      lockDuration: 60_000, // 1 minute
      concurrency: 2,
    }
  )

const main = async () => {
  console.log('[export-processor]: starting export queue processor')

  const app: Express = express()
  const port = process.env.PORT || 3003

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

  const server = app.listen(port, () => {
    console.log(`[export-processor]: started`)
  })

  // This is done after all the setup so it can access the
  // environment that was loaded from GCP
  await appDataSource.initialize()
  await redisDataSource.initialize()

  const redisClient = redisDataSource.redisClient
  const workerRedisClient = redisDataSource.workerRedisClient
  if (!workerRedisClient || !redisClient) {
    throw '[export-processor] error redis is not initialized'
  }

  const worker = createWorker(workerRedisClient)

  workerRedisClient.on('error', (error) => {
    console.trace('[export-processor]: redis worker error', { error })
  })

  redisClient.on('error', (error) => {
    console.trace('[export-processor]: redis error', { error })
  })

  const gracefulShutdown = async (signal: string) => {
    console.log(`[export-processor]: Received ${signal}, closing server...`)
    await new Promise<void>((resolve) => {
      server.close((err) => {
        console.log('[export-processor]: Express server closed')
        if (err) {
          console.log('[export-processor]: error stopping server', { err })
        }

        resolve()
      })
    })
    await worker.close()
    console.log('[export-processor]: Worker closed')

    await redisDataSource.shutdown()
    console.log('[export-processor]: Redis connection closed')

    await appDataSource.destroy()
    console.log('[export-processor]: DB connection closed')

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
