export interface WorkerConfig {
  contentProcessing: {
    enabled: boolean
    concurrency: number
    memoryLimit: string
  }
  emailProcessing: {
    enabled: boolean
    concurrency: number
  }
  exportProcessing: {
    enabled: boolean
    concurrency: number
  }
}

export const getWorkerConfig = (): WorkerConfig => ({
  contentProcessing: {
    enabled: process.env.ENABLE_CONTENT_WORKER === 'true',
    concurrency: parseInt(process.env.CONTENT_WORKER_CONCURRENCY || '2'),
    memoryLimit: process.env.CONTENT_WORKER_MEMORY_LIMIT || '512MB',
  },
  emailProcessing: {
    enabled: process.env.ENABLE_EMAIL_WORKER === 'true',
    concurrency: parseInt(process.env.EMAIL_WORKER_CONCURRENCY || '2'),
  },
  exportProcessing: {
    enabled: process.env.ENABLE_EXPORT_WORKER === 'true',
    concurrency: parseInt(process.env.EXPORT_WORKER_CONCURRENCY || '2'),
  },
})
