import { Router } from 'express'
import { ContentFormat, UploadContentJobData } from '../jobs/upload_content'
import { findLibraryItemsByIds } from '../services/library_item'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { enqueueBulkUploadContentJob } from '../utils/createTask'
import { logger } from '../utils/logger'
import { generateDownloadSignedUrl } from '../utils/uploads'

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

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/', async (req, res) => {
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
      select: ['id', 'updatedAt'],
    })
    if (libraryItems.length === 0) {
      logger.error('Library items not found')
      return res.status(404).send({ errorCode: 'NOT_FOUND' })
    }

    // generate signed url for each library item
    const data = await Promise.all(
      libraryItems.map(async (libraryItem) => {
        const filePath = `content/${userId}/${
          libraryItem.id
        }.${libraryItem.updatedAt.getTime()}.${format}`

        try {
          const downloadUrl = await generateDownloadSignedUrl(filePath, {
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
          })

          return {
            libraryItemId: libraryItem.id,
            userId,
            filePath,
            downloadUrl,
            format,
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
    logger.info('Signed urls generated', data)

    const validData = data.filter(
      (d) => d.downloadUrl !== undefined && !('error' in d)
    ) as UploadContentJobData[]

    await enqueueBulkUploadContentJob(validData)
    logger.info('Bulk upload content job enqueued', validData)

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
