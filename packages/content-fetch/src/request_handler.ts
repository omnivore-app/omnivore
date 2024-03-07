import { fetchContent } from '@omnivore/puppeteer-parse'
import { RequestHandler } from 'express'
import { queueSavePageJob } from './job'
import { redisDataSource } from './redis_data_source'

interface User {
  id: string
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
  users?: User[]
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
  users?: User[]
  error?: string
  totalTime?: number
}

interface FetchResult {
  finalUrl: string
  title?: string
  content?: string
  contentType?: string
}

export const cacheFetchResult = async (fetchResult: FetchResult) => {
  // cache the fetch result for 24 hours
  const ttl = 24 * 60 * 60
  const key = `fetch-result:${fetchResult.finalUrl}`
  const value = JSON.stringify(fetchResult)
  return redisDataSource.cacheClient.set(key, value, 'EX', ttl, 'NX')
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

  try {
    const fetchResult = await fetchContent(url, locale, timezone)
    const finalUrl = fetchResult.finalUrl

    const savePageJobs = users.map((user) => ({
      userId: user.id,
      data: {
        userId: user.id,
        url,
        finalUrl,
        articleSavingRequestId,
        state,
        labels,
        source,
        folder: user.folder,
        rssFeedUrl,
        savedAt,
        publishedAt,
        taskId,
      },
      isRss: !!rssFeedUrl,
      isImport: !!taskId,
      priority,
    }))

    const cacheResult = await cacheFetchResult(fetchResult)
    console.log('cacheFetchResult result', cacheResult)

    const jobs = await queueSavePageJob(savePageJobs)
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
  }

  res.sendStatus(200)
}
