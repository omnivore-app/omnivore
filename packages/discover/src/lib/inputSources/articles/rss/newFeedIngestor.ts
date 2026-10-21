import { catchError, EMPTY, Observable, Subscriber, tap } from 'rxjs'
import { OmnivoreFeed } from '../../../../types/Feeds'
import { redisDataSource } from '../../../clients/queue/redis_data_source'
import { Job, Worker, createPostgresBackend } from 'bullmq'
import { env } from '../../../../env'

export const BACKEND_QUEUE_NAME = 'omnivore-discover-queue'

// If a user creates a brand new Feed (IE: Never before subscribed to) we will endeavor to
// create all the items from it immediately.
export const newFeeds$ = new Observable<OmnivoreFeed>(
  (subscriber: Subscriber<any>) => {
    const worker = async (job: Job) => {
      const executeJob = (job: Job) => {
        switch (job.name) {
          case 'discover-feed-added':
            subscriber.next(job.data.feed)
            break
          default:
            console.warn(`[queue-processor] unhandled job: ${job.name}`)
        }
      }

      executeJob(job)
    }

    if (env.redis.mq.url) {
      redisDataSource.setOptions({
        cache: env.redis.cache,
        mq: env.redis.mq,
      })
      const initialised = redisDataSource.initialize()

      void initialised.then((dataSource) => {
        const workerRedisClient = redisDataSource.workerRedisClient
        if (!workerRedisClient) {
          throw '[queue-processor] error redis is not initialized'
        }
        workerRedisClient.on('error', (error) => {
          console.trace('[queue-processor]: redis worker error', { error })
        })

        new Worker(BACKEND_QUEUE_NAME, worker, {
          connection: dataSource.workerRedisClient!,
          autorun: true, // start processing jobs immediately
          lockDuration: 60_000, // 1 minute
          concurrency: 2,
        })
      })
    }

    new Worker(
      BACKEND_QUEUE_NAME,
      worker,
      {
        connection: env.pg.mq!,
        autorun: true, // start processing jobs immediately
        lockDuration: 60_000, // 1 minute
        concurrency: 2,
      },
      createPostgresBackend
    )
  }
).pipe(
  catchError((err) => {
    console.log('Caught Error, continuing')
    console.error(err)

    // Return an empty Observable which gets collapsed in the output
    return EMPTY
  })
)
