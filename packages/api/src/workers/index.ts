import { LibraryItemState } from '../entity/library_item'
import { ContentSaveRequestedEvent } from '../events/content/content-save-event'
import { redisDataSource } from '../redis_data_source'
import { Job, Worker } from 'bullmq'

export class ContentWorker {
  private worker: Worker<ContentSaveRequestedEvent, boolean> | null = null
  private queueName = 'content-save-requested'

  constructor(concurrency = 2) {
    this.initializeAndStart(concurrency)
  }

  private initializeAndStart(concurrency: number): void {
    const redisConnection = this.getRedisConnection()

    this.worker = new Worker<ContentSaveRequestedEvent, boolean>(
      this.queueName,
      this.processJob.bind(this),
      {
        connection: redisConnection,
        concurrency,
        limiter: { max: 10, duration: 1000 },
        autorun: true,
      }
    )

    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.worker?.on(
      'completed',
      (job: Job<ContentSaveRequestedEvent>, result: boolean) => {
        console.info(`${job.id} ${job.data.libraryItemId} ${result}`)
      }
    )

    this.worker?.on(
      'failed',
      (job: Job<ContentSaveRequestedEvent> | undefined, error: Error) => {
        if (!job) return
        console.error(`${job.id} ${job.data.libraryItemId} ${error.message}`)
      }
    )

    this.worker?.on('error', (error: Error) => {
      console.error(`${error.message}`)
    })
  }

  private getRedisConnection() {
    if (!redisDataSource.workerRedisClient) {
      throw new Error('Redis worker client not initialized')
    }

    return {
      host: redisDataSource.workerRedisClient.options.host,
      port: redisDataSource.workerRedisClient.options.port,
      password: redisDataSource.workerRedisClient.options.password,
      db: redisDataSource.workerRedisClient.options.db,
    }
  }

  private processJob(job: Job<ContentSaveRequestedEvent>): Promise<boolean> {
    const { userId, libraryItemId, url, contentType, metadata } = job.data

    if (!userId?.trim()) throw new Error('userId is required')
    if (!libraryItemId?.trim()) throw new Error('libraryItemId is required')
    if (!url?.trim()) throw new Error('url is required')
    if (!contentType) throw new Error('contentType is required')
    if (!metadata?.source?.trim())
      throw new Error('metadata.source is required')
    if (!metadata?.savedAt?.trim())
      throw new Error('metadata.savedAt is required')

    // Validate URL format
    try {
      new URL(url)
    } catch {
      throw new Error('Invalid URL format')
    }
    return Promise.resolve(true)
  }
}

// packages/api/src/services/create_page_save_request.ts
// export const createPageSaveRequest = async (params: {
//   userId: string
//   url: string
//   labels: string[]
//   folder: string
//   source: string
//   savedAt: Date
//   publishedAt: Date
// }) => {
//   // Create library item in database
//   const libraryItem = await createOrUpdateLibraryItem(
//     {
//       // ... existing logic
//       state: LibraryItemState.Processing,
//     },
//     userId,
//     pubsub
//   )

//   // Fire single event to dedicated queue
//   await emitContentSaveEvent({
//     eventType: 'CONTENT_SAVE_REQUESTED',
//     userId,
//     libraryItemId: libraryItem.id,
//     url,
//     contentType: detectContentType(url),
//     metadata: {
//       labels,
//       folder,
//       source,
//       savedAt: savedAt?.toISOString(),
//       publishedAt: publishedAt?.toISOString(),
//     },
//   })

//   return libraryItem
// }

// async function emitContentSaveEvent(event: ContentSaveEvent) {}
