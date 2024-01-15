/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Express } from 'express'
import { appDataSource } from './data_source'
import { env } from './env'
import { redisClient, mqRedisClient } from './redis'

import { Worker, Job, QueueEvents } from 'bullmq'
import { refreshAllFeeds } from './jobs/rss/refreshAllFeeds'
import { refreshFeed } from './jobs/rss/refreshFeed'

export const QUEUE_NAME = 'omnivore-backend-queue'

const main = async () => {
  console.log('calling queue-processor start')
  const app: Express = express()
  const port = process.env.PORT || 3002

  await appDataSource.initialize()

  // respond healthy to auto-scaler.
  app.get('/_ah/health', (req, res) => res.sendStatus(200))

  // redis is optional
  if (env.redis.url) {
    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err)
    })

    await redisClient.connect()
    console.log('Redis Client Connected:', env.redis.url)
  }

  // redis for message queue
  if (env.redis.url) {
    mqRedisClient?.on('error', (err) => {
      console.error('Redis Client Error', err)
    })
  }

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      switch (job.name) {
        case 'refresh-all-feeds': {
          return await refreshAllFeeds(appDataSource, mqRedisClient)
        }
        case 'refresh-feed': {
          return await refreshFeed(redisClient, job.data)
        }
      }
      return true
    },
    {
      connection: mqRedisClient,
    }
  )

  const queueEvents = new QueueEvents(QUEUE_NAME, {
    connection: mqRedisClient,
  })

  queueEvents.on('added', async (job) => {
    console.log('added job: ', job.jobId)
  })

  queueEvents.on('removed', async (job) => {
    console.log('removed job: ', job.jobId)
  })

  queueEvents.on('completed', async (job) => {
    console.log('completed job: ', job.jobId)
  })

  process.on('SIGINT', async () => {
    console.log('[queue-processor]: Received SIGTERM. Shutting down.')
    await redisClient.disconnect()
    mqRedisClient.disconnect()
  })

  app.listen(port, () => {
    console.log(`[queue-processor]: started`)
  })
}

// only call main if the file was called from the CLI and wasn't required from another module
if (require.main === module) {
  main().catch((e) => console.error(e))
}
