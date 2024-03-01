import axios from 'axios'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { env } from '../env'
import {
  ArticleSavingRequestStatus,
  CreateLabelInput,
} from '../generated/graphql'
import { redisDataSource } from '../redis_data_source'
import { userRepository } from '../repository/user'
import { saveFile } from '../services/save_file'
import { savePage } from '../services/save_page'
import { uploadFile } from '../services/upload_file'
import { logger } from '../utils/logger'

const signToken = promisify(jwt.sign)

const IMPORTER_METRICS_COLLECTOR_URL = env.queue.importerMetricsUrl
const JWT_SECRET = env.server.jwtSecret

const MAX_ATTEMPTS = 2
const REQUEST_TIMEOUT = 30000 // 30 seconds

interface Data {
  userId: string
  url: string
  finalUrl: string
  articleSavingRequestId: string
  state?: string
  labels?: CreateLabelInput[]
  source: string
  folder: string
  rssFeedUrl?: string
  savedAt?: string
  publishedAt?: string
  taskId?: string
}

interface FetchResult {
  finalUrl: string
  title?: string
  content?: string
  contentType?: string
}

const isFetchResult = (obj: unknown): obj is FetchResult => {
  return typeof obj === 'object' && obj !== null && 'finalUrl' in obj
}

const uploadToSignedUrl = async (
  uploadSignedUrl: string,
  contentType: string,
  contentObjUrl: string
) => {
  logger.info('uploading to signed url', {
    uploadSignedUrl,
    contentType,
    contentObjUrl,
  })

  try {
    const stream = await axios.get(contentObjUrl, {
      responseType: 'stream',
      timeout: REQUEST_TIMEOUT,
    })
    return await axios.put(uploadSignedUrl, stream.data, {
      headers: {
        'Content-Type': contentType,
      },
      maxBodyLength: 1000000000,
      maxContentLength: 100000000,
      timeout: REQUEST_TIMEOUT,
    })
  } catch (error) {
    logger.error('error uploading to signed url', error)
    return null
  }
}

const uploadPdf = async (
  url: string,
  userId: string,
  articleSavingRequestId: string
) => {
  const result = await uploadFile(
    {
      url,
      contentType: 'application/pdf',
      clientRequestId: articleSavingRequestId,
      createPageEntry: true,
    },
    userId
  )
  if (!result.uploadSignedUrl || !result.createdPageId) {
    throw new Error('error while getting upload id and signed url')
  }

  const uploaded = await uploadToSignedUrl(
    result.uploadSignedUrl,
    'application/pdf',
    url
  )
  if (!uploaded) {
    throw new Error('error while uploading pdf')
  }

  return {
    uploadFileId: result.id,
    itemId: result.createdPageId,
  }
}

const sendImportStatusUpdate = async (
  userId: string,
  taskId: string,
  isImported?: boolean
) => {
  try {
    logger.info('sending import status update')
    const auth = await signToken({ uid: userId }, JWT_SECRET)

    await axios.post(
      IMPORTER_METRICS_COLLECTOR_URL,
      {
        taskId,
        status: isImported ? 'imported' : 'failed',
      },
      {
        headers: {
          Authorization: auth as string,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    )
  } catch (e) {
    logger.error('error while sending import status update', e)
  }
}

const getCachedFetchResult = async (url: string) => {
  const key = `fetch-result:${url}`
  if (!redisDataSource.redisClient || !redisDataSource.workerRedisClient) {
    throw new Error('redis client is not initialized')
  }

  let result = await redisDataSource.redisClient.get(key)
  if (!result) {
    logger.debug(`fetch result is not cached in cache redis ${url}`)
    // fallback to worker redis client if the result is not found
    result = await redisDataSource.workerRedisClient.get(key)
    if (!result) {
      throw new Error('fetch result is not cached')
    }
  }

  const fetchResult = JSON.parse(result) as unknown
  if (!isFetchResult(fetchResult)) {
    throw new Error('fetch result is not valid')
  }

  logger.info('fetch result is cached', url)

  return fetchResult
}

export const savePageJob = async (data: Data, attemptsMade: number) => {
  const {
    userId,
    articleSavingRequestId,
    labels,
    source,
    folder,
    rssFeedUrl,
    savedAt,
    publishedAt,
    taskId,
    url,
    finalUrl,
  } = data
  let isImported,
    isSaved,
    state = data.state

  try {
    logger.info('savePageJob', {
      userId,
      url,
      finalUrl,
    })

    // get the fetch result from cache
    const fetchedResult = await getCachedFetchResult(finalUrl)
    const { title, contentType } = fetchedResult
    let content = fetchedResult.content

    const user = await userRepository.findById(userId)
    if (!user) {
      logger.error('Unable to save job, user can not be found.', {
        userId,
        url,
      })
      // if the user is not found, we do not retry
      return false
    }

    // for pdf content, we need to upload the pdf
    if (contentType === 'application/pdf') {
      const uploadResult = await uploadPdf(
        finalUrl,
        userId,
        articleSavingRequestId
      )

      const result = await saveFile(
        {
          url: finalUrl,
          uploadFileId: uploadResult.uploadFileId,
          state: state ? (state as ArticleSavingRequestStatus) : undefined,
          labels,
          source,
          folder,
          subscription: rssFeedUrl,
          savedAt,
          publishedAt,
          clientRequestId: uploadResult.itemId,
        },
        user
      )
      if (result.__typename == 'SaveError') {
        throw new Error(result.message || result.errorCodes[0])
      }

      isSaved = true
      isImported = true
      return true
    }

    if (!content) {
      logger.info(`content is not fetched: ${finalUrl}`)
      // set the state to failed if we don't have content
      content = 'Failed to fetch content'
      state = ArticleSavingRequestStatus.Failed
    }

    // for non-pdf content, we need to save the page
    const result = await savePage(
      {
        url: finalUrl,
        clientRequestId: articleSavingRequestId,
        title,
        originalContent: content,
        state: state ? (state as ArticleSavingRequestStatus) : undefined,
        labels: labels,
        rssFeedUrl,
        savedAt: savedAt ? new Date(savedAt) : new Date(),
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        source,
        folder,
      },
      user
    )

    if (result.__typename == 'SaveError') {
      throw new Error(result.message || result.errorCodes[0])
    }

    isImported = true
    isSaved = true
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`error while saving page: ${e.message}`)
    } else {
      logger.error('error while saving page: unknown error')
    }

    throw e
  } finally {
    const lastAttempt = attemptsMade === MAX_ATTEMPTS - 1
    if (lastAttempt) {
      logger.info(`last attempt reached ${data.url}`)
    }

    if (taskId && (isSaved || lastAttempt)) {
      // send import status to update the metrics for importer
      await sendImportStatusUpdate(userId, taskId, isImported)
    }
  }

  return true
}
