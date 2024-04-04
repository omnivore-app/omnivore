import { Readability } from '@omnivore/readability'
import { ArticleSavingRequestStatus, ImportContext } from '../src'
import { createRedisClient } from '../src/redis'

export const stubImportCtx = (): ImportContext => {
  const redisClient = createRedisClient(process.env.REDIS_URL)

  return {
    userId: '',
    countImported: 0,
    countFailed: 0,
    urlHandler: (
      ctx: ImportContext,
      url: URL,
      state?: ArticleSavingRequestStatus,
      labels?: string[]
    ): Promise<void> => {
      return Promise.resolve()
    },
    contentHandler: (
      ctx: ImportContext,
      url: URL,
      title: string,
      originalContent: string,
      parseResult: Readability.ParseResult
    ): Promise<void> => {
      return Promise.resolve()
    },
    redisClient,
    taskId: '',
    source: 'csv-importer',
  }
}
