import { fetchContent } from '@omnivore/puppeteer-parse'
import { RequestHandler } from 'express'
import { queueSavePageJob } from './job'

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

// const MAX_RETRY_COUNT = process.env.MAX_RETRY_COUNT || '1'

export const contentFetchRequestHandler: RequestHandler = async (req, res) => {
  const functionStartTime = Date.now()

  const body = <RequestBody>req.body

  // users is used when saving article for multiple users
  let users = body.users || []
  const userId = body.userId
  const folder = body.folder
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
    folder,
    users,
  }

  console.log(`Article parsing request`, logRecord)

  try {
    const fetchResult = await fetchContent(url, locale, timezone)
    const finalUrl = fetchResult.finalUrl
    const title = fetchResult.title
    const content = fetchResult.content
    const contentType = fetchResult.contentType
    const readabilityResult = fetchResult.readabilityResult as unknown

    const savePageJobs = users.map((user) => ({
      url: finalUrl,
      userId: user.id,
      data: {
        userId: user.id,
        url: finalUrl,
        title,
        content,
        contentType,
        readabilityResult,
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
    }))

    const result = await queueSavePageJob(savePageJobs)
    console.log('queueSavePageJob result', result)
    if (!result) {
      logRecord.error = 'error while queueing save page job'
      return res.sendStatus(500)
    }
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
