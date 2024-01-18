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
  userId?: string
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

  let users = body.users || [] // users is used when saving article for multiple users
  const userId = body.userId
  const folder = body.folder
  if (userId) {
    users = [
      {
        id: userId,
        folder: body.folder,
      },
    ] // userId is used when saving article for a single user
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
    userId,
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

  // let importStatus,
  //   statusCode = 200

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
      },
    }))

    const result = await queueSavePageJob(savePageJobs)
    console.log('queueSavePageJob result', result)
    if (!result) {
      logRecord.error = 'error while queueing save page job'
      return res.sendStatus(500)
    }

    // if (fetchResult.contentType === 'application/pdf') {
    //   const uploadFileId = await uploadPdf(
    //     finalUrl,
    //     userId,
    //     articleSavingRequestId
    //   )
    //   const uploadedPdf = await sendCreateArticleMutation(userId, {
    //     url: encodeURI(finalUrl),
    //     articleSavingRequestId,
    //     uploadFileId,
    //     state,
    //     labels,
    //     source,
    //     folder,
    //     rssFeedUrl,
    //     savedAt,
    //     publishedAt,
    //   })
    //   if (!uploadedPdf) {
    //     statusCode = 500
    //     logRecord.error = 'error while saving uploaded pdf'
    //   } else {
    //     importStatus = 'imported'
    //   }
    // } else {
    //   const apiResponse = await sendSavePageMutation(userId, {
    //     url,
    //     clientRequestId: articleSavingRequestId,
    //     title,
    //     originalContent: content,
    //     parseResult: readabilityResult,
    //     state,
    //     labels,
    //     rssFeedUrl,
    //     savedAt,
    //     publishedAt,
    //     source,
    //     folder,
    //   })
    //   if (!apiResponse) {
    //     logRecord.error = 'error while saving page'
    //     statusCode = 500
    //   } else if (
    //     'error' in apiResponse &&
    //     apiResponse.error === 'UNAUTHORIZED'
    //   ) {
    //     console.log('user is deleted, do not retry', logRecord)
    //     return res.sendStatus(200)
    //   } else {
    //     importStatus = readabilityResult ? 'imported' : 'failed'
    //   }
    // }
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

    // // mark import failed on the last failed retry
    // const retryCount = req.headers['x-cloudtasks-taskretrycount']
    // if (retryCount === MAX_RETRY_COUNT) {
    //   console.log('max retry count reached')
    //   importStatus = importStatus || 'failed'
    // }
    // // send import status to update the metrics
    // if (taskId && importStatus) {
    //   await sendImportStatusUpdate(userId, taskId, importStatus)
    // }
    // res.sendStatus(statusCode)
  }

  res.sendStatus(200)
}
