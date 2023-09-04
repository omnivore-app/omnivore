/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import cors from 'cors'
import express from 'express'
import * as jwt from 'jsonwebtoken'
import { LibraryItemState, LibraryItemType } from '../entity/library_item'
import { Recommendation } from '../entity/recommendation'
import { UploadFile } from '../entity/upload_file'
import { env } from '../env'
import { UploadFileStatus } from '../generated/graphql'
import { authTrx } from '../repository'
import { Claims } from '../resolvers/types'
import {
  createLibraryItem,
  findLibraryItemById,
  findLibraryItemByUrl,
  updateLibraryItem,
} from '../services/library_item'
import { getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import {
  fileNameForFilePath,
  generateSlug,
  isString,
  titleForFilePath,
  validateUuid,
} from '../utils/helpers'
import { logger } from '../utils/logger'
import {
  generateUploadFilePathName,
  generateUploadSignedUrl,
} from '../utils/uploads'

export function pageRouter() {
  const router = express.Router()

  // Create a page from an uploaded PDF document
  router.options('/pdf', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  router.put('/pdf', cors<express.Request>(corsConfig), async (req, res) => {
    const token = req?.cookies?.auth || req?.headers?.authorization
    if (!token || !jwt.verify(token, env.server.jwtSecret)) {
      return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
    }
    const claims = jwt.decode(token) as Claims

    // Get the content type from the query params
    const { url, clientRequestId } = req.query
    const contentType = req.headers['content-type']
    logger.info(
      'contentType',
      contentType,
      'url',
      url,
      'clientRequestId',
      clientRequestId
    )

    if (
      !isString(url) ||
      !isString(contentType) ||
      !isString(clientRequestId)
    ) {
      logger.info(
        'creating page from pdf failed',
        url,
        contentType,
        clientRequestId
      )
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    if (!validateUuid(clientRequestId)) {
      logger.info('creating page from pdf failed  invalid uuid')
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    const title = titleForFilePath(url)
    const fileName = fileNameForFilePath(url)
    const uploadFileData = await authTrx(
      (t) =>
        t.getRepository(UploadFile).save({
          url,
          userId: claims.uid,
          fileName,
          status: UploadFileStatus.Initialized,
          contentType: 'application/pdf',
        }),
      undefined,
      claims.uid
    )

    const uploadFilePathName = generateUploadFilePathName(
      uploadFileData.id,
      fileName
    )

    const signedUrl = await generateUploadSignedUrl(
      uploadFilePathName,
      'application/pdf'
    )

    const item = await findLibraryItemByUrl(url, claims.uid)

    if (item) {
      logger.info('updating page')
      await updateLibraryItem(
        item.id,
        {
          savedAt: new Date(),
          archivedAt: null,
          state: LibraryItemState.Succeeded,
        },
        claims.uid
      )
    } else {
      logger.info('creating page')
      await createLibraryItem(
        {
          originalUrl: signedUrl,
          id: clientRequestId,
          user: { id: claims.uid },
          title,
          originalContent: '',
          itemType: LibraryItemType.File,
          uploadFile: { id: uploadFileData.id },
          slug: generateSlug(uploadFilePathName),
          state: LibraryItemState.Processing,
        },
        claims.uid
      )
    }

    logger.info('redirecting to signed URL', signedUrl)
    return res.redirect(signedUrl)
  })

  // Add recommended pages to a user's library
  router.options(
    '/recommend',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )
  router.post(
    '/recommend',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      const token = getTokenByRequest(req)
      if (!token || !jwt.verify(token, env.server.jwtSecret)) {
        return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
      }
      const claims = jwt.decode(token) as Claims

      const { userId, pageId, recommendation, highlightIds } = req.body as {
        userId: string
        pageId: string
        recommendation: Recommendation
        highlightIds?: string[]
      }
      if (!userId || !pageId || !recommendation) {
        return res.status(400).send({ errorCode: 'BAD_DATA' })
      }

      const item = await findLibraryItemById(pageId, userId)
      if (!item) {
        return res.status(404).send({ errorCode: 'NOT_FOUND' })
      }

      const recommendedPageId = await addRecommendation(
        ctx,
        page,
        recommendation,
        highlightIds
      )
      if (!recommendedPageId) {
        logger.error('Failed to add recommendation to page')
        return res.sendStatus(500)
      }

      return res.send({ recommendedPageId })
    }
  )

  return router
}
