import { Readability } from '@omnivore/readability'
import Redis from 'ioredis'
import { ArticleSavingRequestStatus, ImportContext } from '../src'

export const stubImportCtx = (redisClient: Redis): ImportContext => {
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
