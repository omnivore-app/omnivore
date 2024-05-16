import cors from 'cors'
import express, { Router } from 'express'
import { ContentFormat, UploadContentJobData } from '../jobs/upload_content'
import { findLibraryItemsByIds } from '../services/library_item'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { enqueueBulkUploadContentJob } from '../utils/createTask'
import { logger } from '../utils/logger'
import {
  contentFilePath,
  generateDownloadSignedUrl,
  isFileExists,
} from '../utils/uploads'

export function contentRouter() {
  const router = Router()

  interface GetContentRequest {
    libraryItemIds: string[]
    format: ContentFormat
  }

  const isContentRequest = (data: any): data is GetContentRequest => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'libraryItemIds' in data &&
      'format' in data
    )
  }

  router.options('/', cors<express.Request>({ ...corsConfig, maxAge: 600 }))

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/', cors<express.Request>(corsConfig), async (req, res) => {
    if (!isContentRequest(req.body)) {
      logger.error('Bad request')
      return res.status(400).send({ errorCode: 'BAD_REQUEST' })
    }

    const { libraryItemIds, format } = req.body
    if (
      !Array.isArray(libraryItemIds) ||
      libraryItemIds.length === 0 ||
      libraryItemIds.length > 50
    ) {
      logger.error('Library item ids are invalid')
      return res.status(400).send({ errorCode: 'BAD_REQUEST' })
    }

    const token = getTokenByRequest(req)
    // get claims from token
    const claims = await getClaimsByToken(token)
    if (!claims) {
      logger.error('Token not found')
      return res.status(401).send({
        error: 'UNAUTHORIZED',
      })
    }

    // get user by uid from claims
    const userId = claims.uid

    const libraryItems = await findLibraryItemsByIds(libraryItemIds, userId, {
      select: ['id', 'updatedAt', 'savedAt'],
    })
    if (libraryItems.length === 0) {
      logger.error('Library items not found')
      return res.status(404).send({ errorCode: 'NOT_FOUND' })
    }

    // generate signed url for each library item
    const data = await Promise.all(
      libraryItems.map(async (libraryItem) => {
        const filePath = contentFilePath({
          userId,
          libraryItemId: libraryItem.id,
          format,
          savedAt: libraryItem.savedAt,
          updatedAt: libraryItem.updatedAt,
        })

        try {
          const downloadUrl = await generateDownloadSignedUrl(filePath, {
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
          })

          // check if file is already uploaded
          const exists = await isFileExists(filePath)
          if (exists) {
            logger.info(`File already exists: ${filePath}`)
          }

          return {
            libraryItemId: libraryItem.id,
            userId,
            filePath,
            downloadUrl,
            format,
            exists,
          }
        } catch (error) {
          logger.error('Error while generating signed url', error)
          return {
            libraryItemId: libraryItem.id,
            error: 'Failed to generate download url',
          }
        }
      })
    )
    logger.info(
      'Signed urls generated',
      data.map((d) => d.downloadUrl)
    )

    // skip uploading if there is an error or file already exists
    const uploadData = data.filter(
      (d) => !('error' in d) && d.downloadUrl !== undefined && !d.exists
    ) as UploadContentJobData[]

    if (uploadData.length > 0) {
      const jobs = await enqueueBulkUploadContentJob(uploadData)
      logger.info('Bulk upload content job enqueued', jobs)
    }

    res.send({
      data: data.map((d) => ({
        libraryItemId: d.libraryItemId,
        downloadUrl: d.downloadUrl,
        error: d.error,
      })),
    })
  })

  return router
}
