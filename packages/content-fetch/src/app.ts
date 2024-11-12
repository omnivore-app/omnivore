import { RedisDataSource } from '@omnivore/utils'
import { JobType } from 'bullmq'
import express, { Express } from 'express'
import asyncHandler from 'express-async-handler'
import { JobData, processFetchContentJob } from './request_handler'
import { createWorker, getQueue, QUEUE } from './worker'

const main = () => {
  console.log('Starting worker...')

  if (!process.env.VERIFICATION_TOKEN) {
    console.error('VERIFICATION_TOKEN is required')
    process.exit(1)
  }

  const app: Express = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

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

  const worker = createWorker(redisDataSource)

  // respond healthy to auto-scaler.
  app.get('/_ah/health', (req, res) => res.sendStatus(200))

  app.get(
    '/lifecycle/prestop',
    asyncHandler(async (_req, res) => {
      console.log('Prestop lifecycle hook called.')

      await worker.close()
      console.log('Worker closed')

      res.sendStatus(200)
    })
  )

  app.get(
    '/metrics',
    asyncHandler(async (_, res) => {
      let output = ''

      const queue = await getQueue(redisDataSource.queueRedisClient)

      const jobsTypes: Array<JobType> = [
        'active',
        'failed',
        'completed',
        'prioritized',
      ]
      const counts = await queue.getJobCounts(...jobsTypes)

      jobsTypes.forEach((metric) => {
        output += `# TYPE omnivore_queue_messages_${metric} gauge\n`
        output += `omnivore_queue_messages_${metric}{queue="${QUEUE}"} ${counts[metric]}\n`
      })

      // Export the age of the oldest prioritized job in the queue
      const oldestJobs = await queue.getJobs(['prioritized'], 0, 1, true)
      if (oldestJobs.length > 0) {
        const currentTime = Date.now()
        const ageInSeconds = (currentTime - oldestJobs[0].timestamp) / 1000
        output += `# TYPE omnivore_queue_messages_oldest_job_age_seconds gauge\n`
        output += `omnivore_queue_messages_oldest_job_age_seconds{queue="${QUEUE}"} ${ageInSeconds}\n`
      } else {
        output += `# TYPE omnivore_queue_messages_oldest_job_age_seconds gauge\n`
        output += `omnivore_queue_messages_oldest_job_age_seconds{queue="${QUEUE}"} ${0}\n`
      }

      res.status(200).setHeader('Content-Type', 'text/plain').send(output)
    })
  )

  app.all(
    '/',
    asyncHandler(async (req, res) => {
      console.log('Received http request')

      if (req.method !== 'GET' && req.method !== 'POST') {
        console.error('request method is not GET or POST')
        res.sendStatus(405)
        return
      }

      if (req.query.token !== process.env.VERIFICATION_TOKEN) {
        console.error('query does not include valid token')
        res.sendStatus(403)
        return
      }

      try {
        const data = <JobData>req.body
        const attempt = parseInt(req.get('X-CloudTasks-TaskRetryCount') || '0')
        await processFetchContentJob(redisDataSource, data, attempt)
      } catch (error) {
        console.error('Error fetching content', { error })
        res.sendStatus(500)
        return
      }

      res.sendStatus(200)
    })
  )

  const port = process.env.PORT || 3002
  const server = app.listen(port, () => {
    console.log('Worker started')
  })

  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}, closing server...`)
    await new Promise<void>((resolve) => {
      server.close((err) => {
        console.log('Express server closed')
        if (err) {
          console.log('Error stopping server', { err })
        }

        resolve()
      })
    })

    await worker.close()
    console.log('Worker closed')

    await redisDataSource.shutdown()
    console.log('Redis connection closed')

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
