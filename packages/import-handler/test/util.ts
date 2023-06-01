import { Readability } from '@omnivore/readability'
import { createClient } from 'redis'
import { ArticleSavingRequestStatus, ImportContext } from '../src'

export const createRedisClient = async (url?: string) => {
  const redisClient = createClient({
    url,
  })

  redisClient.on('error', (err) => console.error('Redis Client Error', err))

  await redisClient.connect()
  console.log('Redis Client Connected:', url)

  return redisClient
}

export const stubImportCtx = async () => {
  const redisClient = await createRedisClient(process.env.REDIS_URL)
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
