import axios from 'axios'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { env } from '../env'
import {
  ArticleSavingRequestStatus,
  CreateLabelInput,
} from '../generated/graphql'
import { userRepository } from '../repository/user'
import { saveFile } from '../services/save_file'
import { savePage } from '../services/save_page'
import { uploadFile } from '../services/upload_file'
import { logError, logger } from '../utils/logger'
import { downloadFromUrl, uploadToSignedUrl } from '../utils/uploads'
import { downloadStringFromBucket } from '../utils/uploads'

const signToken = promisify(jwt.sign)

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

  state?: string
  labels?: CreateLabelInput[]
  source: string
  folder: string
  rssFeedUrl?: string
  savedAt?: string
  publishedAt?: string
  taskId?: string
  contentHash?: string
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

  logger.info('downloading content', {
    url,
  })

  const data = await downloadFromUrl(url, REQUEST_TIMEOUT)

  const uploadSignedUrl = result.uploadSignedUrl
  const contentType = 'application/pdf'
  logger.info('uploading to signed url', {
    uploadSignedUrl,
    contentType,
  })
  await uploadToSignedUrl(uploadSignedUrl, data, contentType, REQUEST_TIMEOUT)

  logger.info('pdf uploaded successfully', {
    url,
    uploadFileId: result.id,
    itemId: result.createdPageId,
  })

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
    logError(e)
  }
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
    title,
    contentType,
    contentHash,
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

    let originalContent
    if (!contentHash) {
      logger.info(`content is not uploaded: ${finalUrl}`)
      // set the state to failed if we don't have content
      originalContent = 'Failed to fetch content'
      state = ArticleSavingRequestStatus.Failed
    } else {
      // download content from the bucket
      const downloaded = await downloadStringFromBucket(
        `originalContent/${contentHash}`
      )
      if (!downloaded) {
        logger.error('error while downloading content from bucket')
        originalContent = 'Failed to fetch content'
        state = ArticleSavingRequestStatus.Failed
      } else {
        originalContent = downloaded
      }
    }

    // for non-pdf content, we need to save the page
    const result = await savePage(
      {
        url: finalUrl,
        clientRequestId: articleSavingRequestId,
        title,
        originalContent,
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
    logError(e)

    throw e
  } finally {
    const lastAttempt = attemptsMade + 1 === MAX_IMPORT_ATTEMPTS

    if (taskId && (isSaved || lastAttempt)) {
      logger.info('sending import status update')
      // send import status to update the metrics for importer
      await sendImportStatusUpdate(userId, taskId, isImported)
    }
  }

  return true
}
