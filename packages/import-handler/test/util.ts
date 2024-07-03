import { Readability } from '@omnivore/readability'
import { RedisDataSource } from '@omnivore/utils'
import { ArticleSavingRequestStatus, ImportContext } from '../src'

export const stubImportCtx = (): ImportContext => {
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
    redisClient: redisDataSource.cacheClient,
    taskId: '',
    source: 'csv-importer',
  }
}
