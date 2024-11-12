import { catchError, EMPTY, Observable, Subscriber, tap } from 'rxjs'
import { OmnivoreFeed } from '../../../../types/Feeds'
import { redisDataSource } from '../../../clients/queue/redis_data_source'
import { Job, Worker } from 'bullmq'
import { env } from '../../../../env'

export const BACKEND_QUEUE_NAME = 'omnivore-discover-queue'

// If a user creates a brand new Feed (IE: Never before subscribed to) we will endeavor to
// create all the items from it immediately.
export const newFeeds$ = new Observable<OmnivoreFeed>(
  (subscriber: Subscriber<any>) => {
    // client
    //   .topic(TOPIC_NAME)
    //   .exists()
    //   .then((exists) => {
    //     if (exists[0]) {
    //       return client
    //         .topic(TOPIC_NAME)
    //         .subscription(`${TOPIC_NAME}Discover`)
    //         .exists()
    //         .then((subExists) => {
    //           if (subExists[0]) {
    //             return client
    //               .topic(TOPIC_NAME)
    //               .subscription(`${TOPIC_NAME}Discover`)
    //           }
    //
    //           return client
    //             .topic(TOPIC_NAME)
    //             .createSubscription(`${TOPIC_NAME}Discover`)
    //             .then((_sub) => {
    //               return client
    //                 .topic(TOPIC_NAME)
    //                 .subscription(`${TOPIC_NAME}Discover`)
    //             })
    //         })
    //     }
    //
    //     return client.createTopic(TOPIC_NAME).then((_) => {
    //       return client
    //         .topic(TOPIC_NAME)
    //         .createSubscription(`${TOPIC_NAME}Discover`)
    //         .then((_sub) => {
    //           return client
    //             .topic(TOPIC_NAME)
    //             .subscription(`${TOPIC_NAME}Discover`)
    //         })
    //     })
    //   })
    //   .then((subscription) => {
    //     subscription.on('message', (msg: Message) => {
    //       const parsedMessage = JSON.parse(msg.data.toString())
    //       if (parsedMessage.ruleEventType == 'DISCOVER_FEED_CREATED') {
    //         subscriber.next(parsedMessage.feed as OmnivoreFeed)
    //       }
    //       msg.ack()
    //     })
    //   })
    //   .catch((e) => {
    //     console.error(
    //       'Error creating Subscription, continuing without new feed parsing...',
    //       e
    //     )
    //   })

    console.log('[queue-processor]: starting queue processor')
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

      new Worker(
        BACKEND_QUEUE_NAME,
        // eslint-disable-next-line @typescript-eslint/require-await
        async (job: Job) => {
          const executeJob = (job: Job) => {
            console.log(JSON.stringify(job))
            switch (job.name) {
              case 'discover-feed-added':
                subscriber.next(job.data.feed)
                break
              default:
                console.warn(`[queue-processor] unhandled job: ${job.name}`)
            }
          }

          executeJob(job)
        },
        {
          connection: dataSource.workerRedisClient!,
          autorun: true, // start processing jobs immediately
          lockDuration: 60_000, // 1 minute
          concurrency: 2,
        }
      )

      workerRedisClient.on('error', (error) => {
        console.trace('[queue-processor]: redis worker error', { error })
      })
    })
  }
).pipe(
  tap(console.log),
  catchError((err) => {
    console.log('Caught Error, continuing')
    console.error(err)

    // Return an empty Observable which gets collapsed in the output
    return EMPTY
  })
)
