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
import { logError, logger } from '../utils/logger'
import {
  contentFilePath,
  downloadFromBucket,
  downloadFromUrl,
  isFileExists,
  uploadToSignedUrl,
} from '../utils/uploads'

const signToken = (
  payload: string | object | Buffer,
  secret: jwt.Secret,
  options?: jwt.SignOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options || {}, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(token as string)
      }
    })
  })
}

const IMPORTER_METRICS_COLLECTOR_URL = env.queue.importerMetricsUrl
const JWT_SECRET = env.server.jwtSecret

const MAX_IMPORT_ATTEMPTS = 1
const REQUEST_TIMEOUT = 30000 // 30 seconds

interface Data {
  userId: string
  url: string
  finalUrl: string
  articleSavingRequestId: string
  title: string
  contentType: string
  savedAt: string

  state?: string
  labels?: CreateLabelInput[]
  source: string
  folder: string
  rssFeedUrl?: string
  publishedAt?: string
  taskId?: string
  cacheKey?: string
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

const getCachedContent = async (key: string): Promise<string | undefined> => {
  const result = await redisDataSource.redisClient?.get(key)
  if (!result) {
    logger.info('fetch result is not cached', { key })
    return undefined
  }

  const fetchResult = JSON.parse(result) as unknown
  if (!isFetchResult(fetchResult)) {
    logger.error('invalid fetch result in cache', { key })
    return undefined
  }

  logger.info('fetch result is cached', { key })

  return fetchResult.content
}

const uploadPdf = async (
  url: string,
  userId: string,
  articleSavingRequestId: string
) => {
  logger.info('starting pdf upload process', {
    url,
    userId,
    articleSavingRequestId,
  })

  try {
    const result = await uploadFile(
      {
        url,
        contentType: 'application/pdf',
        clientRequestId: articleSavingRequestId,
        createPageEntry: true,
      },
      userId
    )

    logger.info('upload file result', {
      result,
      uploadSignedUrl: result.uploadSignedUrl,
      createdPageId: result.createdPageId,
    })

    if (!result.uploadSignedUrl || !result.createdPageId) {
      throw new Error('Missing upload signed URL or created page ID')
    }

    logger.info('downloading content from source', {
      sourceUrl: url,
      timeout: REQUEST_TIMEOUT,
    })

    const data = await downloadFromUrl(url, REQUEST_TIMEOUT)

    if (!data || data.length === 0) {
      throw new Error('Downloaded PDF data is empty')
    }

    logger.info('downloaded content successfully', {
      sourceUrl: url,
      contentSize: data.length,
    })

    const uploadSignedUrl = result.uploadSignedUrl
    const contentType = 'application/pdf'

    logger.info('attempting upload to signed url', {
      uploadSignedUrl,
      contentType,
      dataSize: data.length,
    })

    await uploadToSignedUrl(uploadSignedUrl, data, contentType, REQUEST_TIMEOUT)

    logger.info('pdf upload completed successfully', {
      url,
      uploadFileId: result.id,
      itemId: result.createdPageId,
    })

    return {
      uploadFileId: result.id,
      itemId: result.createdPageId,
    }
  } catch (error) {
    logger.error('PDF upload process failed', {
      url,
      userId,
      articleSavingRequestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

const sendImportStatusUpdate = async (
  userId: string,
  taskId: string,
  isImported?: boolean
) => {
  try {
    logger.info('sending import status update')
    const auth = await signToken({ uid: userId }, JWT_SECRET, {})

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
        timeout: 5000,
      }
    )
  } catch (e) {
    logError(e)
  }
}

export const savePageJob = async (data: Data, attemptsMade: number) => {
  ;``
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
    title,
    contentType,
    state,
    cacheKey,
  } = data
  let isImported, isSaved

  logger.info('savePageJob', {
    userId,
    url,
    finalUrl,
  })

  const user = await userRepository.findById(userId)
  if (!user) {
    logger.error('Unable to save job, user can not be found.', {
      userId,
      url,
    })
    // if the user is not found, we do not retry
    return false
  }

  try {
    // for pdf content, we need to upload the pdf
    if (contentType === 'application/pdf') {
      const uploadResult = await uploadPdf(
        finalUrl,
        userId,
        articleSavingRequestId
      )

      if (!uploadResult) {
        throw new Error('error while uploading pdf')
      }

      const result = await saveFile(
        {
          url: finalUrl,
          uploadFileId: uploadResult.uploadFileId,
          state: (state as ArticleSavingRequestStatus) || undefined,
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

    let content

    if (cacheKey) {
      logger.info('fetching content from cache', {
        cacheKey,
      })
      content = await getCachedContent(cacheKey)

      if (content) {
        logger.info('fetched content from cache')
      }
    }

    if (!content) {
      logger.info(
        'content not found from cache, downloading content from GCS',
        {
          url,
        }
      )

      // download the original content
      const filePath = contentFilePath({
        userId,
        libraryItemId: articleSavingRequestId,
        format: 'original',
        savedAt: new Date(savedAt),
      })
      const exists = await isFileExists(filePath)
      if (!exists) {
        logger.error('Original content file does not exist', {
          finalUrl,
          filePath,
        })

        throw new Error('Original content file does not exist')
      }

      content = (await downloadFromBucket(filePath)).toString()
      logger.info('Downloaded original content from:', { filePath })
    }

    // for non-pdf content, we need to save the content
    const result = await savePage(
      {
        url: finalUrl,
        clientRequestId: articleSavingRequestId,
        title,
        originalContent: content,
        state: (state as ArticleSavingRequestStatus) || undefined,
        labels,
        rssFeedUrl,
        savedAt,
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
    logError(e)

    throw e
  } finally {
    const lastAttempt = attemptsMade + 1 >= MAX_IMPORT_ATTEMPTS

    if (taskId && (isSaved || lastAttempt)) {
      logger.info('sending import status update')
      // send import status to update the metrics for importer
      await sendImportStatusUpdate(userId, taskId, isImported)
    }
  }

  return true
}
