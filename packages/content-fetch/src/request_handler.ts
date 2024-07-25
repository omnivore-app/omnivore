import { Storage } from '@google-cloud/storage'
import { fetchContent } from '@omnivore/puppeteer-parse'
import { RedisDataSource } from '@omnivore/utils'
import 'dotenv/config'
import { RequestHandler } from 'express'
import { analytics } from './analytics'
import { queueSavePageJob } from './job'

interface UserConfig {
  id: string
  libraryItemId: string
  folder?: string
}

interface RequestBody {
  url: string
  userId?: string
  saveRequestId: string
  state?: string
  labels?: string[]
  source?: string
  taskId?: string
  locale?: string
  timezone?: string
  rssFeedUrl?: string
  savedAt?: string
  publishedAt?: string
  folder?: string
  users?: UserConfig[]
  priority: 'high' | 'low'
}

interface LogRecord {
  url: string
  articleSavingRequestId: string
  labels: {
    source: string
  }
  state?: string
  labelsToAdd?: string[]
  taskId?: string
  locale?: string
  timezone?: string
  rssFeedUrl?: string
  savedAt?: string
  publishedAt?: string
  folder?: string
  users?: UserConfig[]
  error?: string
  totalTime?: number
}

interface FetchResult {
  finalUrl: string
  title?: string
  content?: string
  contentType?: string
}

const storage = process.env.GCS_UPLOAD_SA_KEY_FILE_PATH
  ? new Storage({ keyFilename: process.env.GCS_UPLOAD_SA_KEY_FILE_PATH })
  : new Storage()
const bucketName = process.env.GCS_UPLOAD_BUCKET || 'omnivore-files'

const NO_CACHE_URLS = [
  'https://deviceandbrowserinfo.com/are_you_a_bot',
  'https://deviceandbrowserinfo.com/info_device',
]

const uploadToBucket = async (filePath: string, data: string) => {
  await storage
    .bucket(bucketName)
    .file(filePath)
    .save(data, { public: false, timeout: 30000 })
}

const uploadOriginalContent = async (
  users: UserConfig[],
  content: string,
  savedTimestamp: number
) => {
  await Promise.all(
    users.map(async (user) => {
      const filePath = `content/${user.id}/${user.libraryItemId}.${savedTimestamp}.original`

      await uploadToBucket(filePath, content)

      console.log(`Original content uploaded to ${filePath}`)
    })
  )
}

const cacheKey = (url: string, locale = '', timezone = '') =>
  `fetch-result:${url}:${locale}:${timezone}`

const isFetchResult = (obj: unknown): obj is FetchResult => {
  return typeof obj === 'object' && obj !== null && 'finalUrl' in obj
}

export const cacheFetchResult = async (
  redisDataSource: RedisDataSource,
  key: string,
  fetchResult: FetchResult
) => {
  // cache the fetch result for 24 hours
  const ttl = 24 * 60 * 60
  const value = JSON.stringify(fetchResult)
  return redisDataSource.cacheClient.set(key, value, 'EX', ttl, 'NX')
}

const getCachedFetchResult = async (
  redisDataSource: RedisDataSource,
  key: string
): Promise<FetchResult | undefined> => {
  const result = await redisDataSource.cacheClient.get(key)
  if (!result) {
    console.info('fetch result is not cached', key)
    return undefined
  }

  const fetchResult = JSON.parse(result) as unknown
  if (!isFetchResult(fetchResult)) {
    console.error('invalid fetch result in cache', key)
    return undefined
  }

  console.info('fetch result is cached', key)

  return fetchResult
}

const failureRedisKey = (domain: string) => `fetch-failure:${domain}`

const isDomainBlocked = async (
  redisDataSource: RedisDataSource,
  domain: string
) => {
  const blockedDomains = ['localhost', 'weibo.com']
  if (blockedDomains.includes(domain)) {
    return true
  }

  const key = failureRedisKey(domain)
  const redisClient = redisDataSource.cacheClient
  try {
    const result = await redisClient.get(key)
    // if the domain has failed to fetch more than certain times, block it
    const maxFailures = parseInt(process.env.MAX_FEED_FETCH_FAILURES ?? '10')
    if (result && parseInt(result) > maxFailures) {
      console.info(`domain is blocked: ${domain}`)
      return true
    }
  } catch (error) {
    console.error('Failed to check domain block status', { domain, error })
  }

  return false
}

const incrementContentFetchFailure = async (
  redisDataSource: RedisDataSource,
  domain: string
) => {
  const redisClient = redisDataSource.cacheClient
  const key = failureRedisKey(domain)
  try {
    const result = await redisClient.incr(key)
    // expire the key in 1 day
    await redisClient.expire(key, 24 * 60 * 60)

    return result
  } catch (error) {
    console.error('Failed to increment failure in redis', { domain, error })
    return null
  }
}

export const contentFetchRequestHandler: RequestHandler = async (req, res) => {
  const functionStartTime = Date.now()

  const body = <RequestBody>req.body

  // users is used when saving article for multiple users
  let users = body.users || []
  const userId = body.userId
  // userId is used when saving article for a single user
  if (userId) {
    users = [
      {
        id: userId,
        folder: body.folder,
        libraryItemId: body.saveRequestId,
      },
    ]
  }
  const articleSavingRequestId = body.saveRequestId
  const state = body.state
  const labels = body.labels
  const source = body.source || 'puppeteer-parse'
  const taskId = body.taskId // taskId is used to update import status
  const url = body.url
  const locale = body.locale
  const timezone = body.timezone
  const rssFeedUrl = body.rssFeedUrl
  const savedAt = body.savedAt
  const publishedAt = body.publishedAt
  const priority = body.priority

  const logRecord: LogRecord = {
    url,
    articleSavingRequestId,
    labels: {
      source,
    },
    state,
    labelsToAdd: labels,
    taskId: taskId,
    locale,
    timezone,
    rssFeedUrl,
    savedAt,
    publishedAt,
    users,
  }

  console.log(`Article parsing request`, logRecord)

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

  try {
    const key = cacheKey(url, locale, timezone)
    let fetchResult = await getCachedFetchResult(redisDataSource, key)
    if (!fetchResult) {
      console.log(
        'fetch result not found in cache, fetching content now...',
        url
      )

      const domain = new URL(url).hostname
      const isBlocked = await isDomainBlocked(redisDataSource, domain)
      if (isBlocked) {
        console.log('domain is blocked', domain)

        return res.sendStatus(200)
      }

      try {
        fetchResult = await fetchContent(url, locale, timezone)
        console.log('content has been fetched')
      } catch (error) {
        await incrementContentFetchFailure(redisDataSource, domain)

        throw error
      }

      if (fetchResult.content && !NO_CACHE_URLS.includes(url)) {
        const cacheResult = await cacheFetchResult(
          redisDataSource,
          key,
          fetchResult
        )
        console.log('cache result', cacheResult)
      }
    }

    const savedDate = savedAt ? new Date(savedAt) : new Date()
    const { finalUrl, title, content, contentType } = fetchResult
    if (content) {
      await uploadOriginalContent(users, content, savedDate.getTime())
    }

    const savePageJobs = users.map((user) => ({
      userId: user.id,
      data: {
        userId: user.id,
        url,
        finalUrl,
        articleSavingRequestId: user.libraryItemId,
        state,
        labels,
        source,
        folder: user.folder,
        rssFeedUrl,
        savedAt: savedDate.toISOString(),
        publishedAt,
        taskId,
        title,
        contentType,
        cacheKey: key,
      },
      isRss: !!rssFeedUrl,
      isImport: !!taskId,
      priority,
    }))

    const jobs = await queueSavePageJob(redisDataSource, savePageJobs)
    console.log('save-page jobs queued', jobs.length)
  } catch (error) {
    if (error instanceof Error) {
      logRecord.error = error.message
    } else {
      logRecord.error = 'unknown error'
    }

    return res.sendStatus(500)
  } finally {
    logRecord.totalTime = Date.now() - functionStartTime
    console.log(`parse-page result`, logRecord)

    // capture events
    analytics.capture(
      users.map((user) => user.id),
      {
        result: logRecord.error ? 'failure' : 'success',
        properties: {
          url,
          source,
          totalTime: logRecord.totalTime,
          errorMessage: logRecord.error,
        },
      }
    )

    await redisDataSource.shutdown()
  }

  res.sendStatus(200)
}
