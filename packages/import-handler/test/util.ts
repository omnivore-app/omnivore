import { Readability } from '@omnivore/readability'
import { ArticleSavingRequestStatus, ImportContext } from '../src'
import { createRedisClient } from '../src/redis'

export const stubImportCtx = async () => {
  const redisClient = await createRedisClient()
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
  }
}
