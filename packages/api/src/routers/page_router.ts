/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import cors from 'cors'
import express from 'express'
import * as jwt from 'jsonwebtoken'
import { createPubSubClient } from '../datalayer/pubsub'
import { createPage, getPageByParam, updatePage } from '../elastic/pages'
import { addRecommendation } from '../elastic/recommendation'
import { Recommendation } from '../elastic/types'
import { uploadFileRepository } from '../entity'
import { env } from '../env'
import {
  ArticleSavingRequestStatus,
  PageType,
  UploadFileStatus,
} from '../generated/graphql'
import { Claims } from '../resolvers/types'
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

    const ctx = {
      uid: claims.uid,
      pubsub: createPubSubClient(),
    }

    const title = titleForFilePath(url)
    const fileName = fileNameForFilePath(url)
    const uploadFileData = await uploadFileRepository.save({
      url,
      userId: claims.uid,
      fileName,
      status: UploadFileStatus.Initialized,
      contentType: 'application/pdf',
    })

    const uploadFilePathName = generateUploadFilePathName(
      uploadFileData.id,
      fileName
    )

    const signedUrl = await generateUploadSignedUrl(
      uploadFilePathName,
      'application/pdf'
    )

    const page = await getPageByParam({
      userId: claims.uid,
      url: url,
    })

    if (page) {
      logger.info('updating page')
      await updatePage(
        page.id,
        {
          savedAt: new Date(),
          archivedAt: null,
        },
        ctx
      )
    } else {
      logger.info('creating page')
      const pageId = await createPage(
        {
          url: signedUrl,
          id: clientRequestId,
          userId: claims.uid,
          title: title,
          hash: uploadFilePathName,
          content: '',
          pageType: PageType.File,
          uploadFileId: uploadFileData.id,
          slug: generateSlug(uploadFilePathName),
          createdAt: new Date(),
          savedAt: new Date(),
          readingProgressPercent: 0,
          readingProgressAnchorIndex: 0,
          state: ArticleSavingRequestStatus.Processing,
        },
        ctx
      )
      if (!pageId) {
        return res.sendStatus(500)
      }
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

      const ctx = {
        uid: userId,
        pubsub: createPubSubClient(),
      }

      const page = await getPageByParam({
        userId: claims.uid,
        _id: pageId,
      })
      if (!page) {
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
