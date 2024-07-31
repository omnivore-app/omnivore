import { RedisDataSource } from '@omnivore/utils'
import { JobType } from 'bullmq'
import express, { Express } from 'express'
import asyncHandler from 'express-async-handler'
import { createWorkers, getQueue } from './worker'

const main = () => {
  console.log('[worker]: starting workers')

  const app: Express = express()
  const port = process.env.PORT || 3002

  // create redis source
  const redisDataSource = new RedisDataSource({
    cache: {
      url: process.env.REDIS_URL,
      cert: process.env.REDIS_CERT,
    },
    mq: {
      url: process.env.MQ_REDIS_URL,
      cert: process.env.MQ_REDIS_CERT,
    },
  })

  const workers = createWorkers(redisDataSource)

  const closeWorkers = async () => {
    await Promise.all(
      workers.map(async (worker) => {
        await worker.close()
        console.log('worker closed:', worker.name)
      })
    )
  }

  // respond healthy to auto-scaler.
  app.get('/_ah/health', (req, res) => res.sendStatus(200))

  app.get(
    '/lifecycle/prestop',
    asyncHandler(async (_req, res) => {
      console.log('prestop lifecycle hook called.')
      await closeWorkers()
      console.log('workers closed')

      res.sendStatus(200)
    })
  )

  app.get(
    '/metrics',
    asyncHandler(async (_, res) => {
      let output = ''

      for (const worker of workers) {
        const queueName = worker.name
        const queue = await getQueue(
          redisDataSource.queueRedisClient,
          queueName
        )

        const jobsTypes: Array<JobType> = [
          'active',
          'failed',
          'completed',
          'prioritized',
        ]
        const counts = await queue.getJobCounts(...jobsTypes)

        jobsTypes.forEach((metric) => {
          output += `# TYPE omnivore_queue_messages_${metric} gauge\n`
          output += `omnivore_queue_messages_${metric}{queue="${queueName}"} ${counts[metric]}\n`
        })

        // Export the age of the oldest prioritized job in the queue
        const oldestJobs = await queue.getJobs(['prioritized'], 0, 1, true)
        if (oldestJobs.length > 0) {
          const currentTime = Date.now()
          const ageInSeconds = (currentTime - oldestJobs[0].timestamp) / 1000
          output += `# TYPE omnivore_queue_messages_oldest_job_age_seconds gauge\n`
          output += `omnivore_queue_messages_oldest_job_age_seconds{queue="${queueName}"} ${ageInSeconds}\n`
        } else {
          output += `# TYPE omnivore_queue_messages_oldest_job_age_seconds gauge\n`
          output += `omnivore_queue_messages_oldest_job_age_seconds{queue="${queueName}"} ${0}\n`
        }
      }

      res.status(200).setHeader('Content-Type', 'text/plain').send(output)
    })
  )

  const server = app.listen(port, () => {
    console.log(`[worker]: Workers started`)
  })

  const gracefulShutdown = async (signal: string) => {
    console.log(`[worker]: Received ${signal}, closing server...`)
    await new Promise<void>((resolve) => {
      server.close((err) => {
        console.log('[worker]: Express server closed')
        if (err) {
          console.log('[worker]: error stopping server', { err })
        }

        resolve()
      })
    })

    await closeWorkers()
    console.log('[worker]: Workers closed')

    await redisDataSource.shutdown()
    console.log('[worker]: Redis connection closed')

    process.exit(0)
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

  process.on('uncaughtException', function (err) {
    // Handle the error safely
    console.error(err, 'Uncaught exception')
  })

  process.on('unhandledRejection', (reason, promise) => {
    // Handle the error safely
    console.error({ promise, reason }, 'Unhandled Rejection at: Promise')
  })
}

// only call main if the file was called from the CLI and wasn't required from another module
if (require.main === module) {
  main()
}
