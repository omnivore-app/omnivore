/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import { ArticleSavingRequestStatus, CreateArticleErrorCode, PageType, UploadFileStatus } from '../generated/graphql'
import { isSiteBlockedForParse } from '../utils/blocked'
import cors from 'cors'
import { env } from '../env'
import { buildLogger } from '../utils/logger'
import * as jwt from 'jsonwebtoken'
import { corsConfig } from '../utils/corsConfig'
import { createPageSaveRequest } from '../services/create_page_save_request'
import { initModels } from '../server'
import { kx } from '../datalayer/knex_config'
import { fileNameForFilePath, generateSlug, isString, titleForFilePath, validateUuid } from '../utils/helpers'
import { generateUploadFilePathName, generateUploadSignedUrl } from '../utils/uploads'
import { Claims } from '../resolvers/types'
import { createPage, getPageByParam, updatePage } from '../elastic/pages'
import { createPubSubClient } from '../datalayer/pubsub'

const logger = buildLogger('app.dispatch')

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
    console.log('contentType', contentType, 'url', url, 'clientRequestId', clientRequestId)

    if (!isString(url) || !isString(contentType) || !isString(clientRequestId)) {
      console.log('creating page from pdf failed', url, contentType, clientRequestId)
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    if (!validateUuid(clientRequestId)) {
      console.log('creating page from pdf failed  invalid uuid')
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    const models = initModels(kx, false)
    const ctx = {
      uid: claims.uid,
      pubsub: createPubSubClient(),
    }

    const title = titleForFilePath(url)
    const fileName = fileNameForFilePath(url)
    const uploadFileData = await models.uploadFile.create({
      url: url,
      userId: claims.uid,
      fileName: fileName,
      status: UploadFileStatus.Initialized,
      contentType: "application/pdf",
    })

    const uploadFilePathName = generateUploadFilePathName(
      uploadFileData.id,
      fileName,
    )

    const signedUrl = await generateUploadSignedUrl(uploadFilePathName, "application/pdf")  


    const page = await getPageByParam({
      userId: claims.uid,
      url: url,
    })

    if (page) {
      console.log('updating page')
      await updatePage(
        page.id,
        {
          savedAt: new Date(),
          archivedAt: null,
        },
        ctx
      )
    } else {
      console.log('creating page')
      const pageId = await createPage({
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
      }, ctx)
      if (!pageId) {
        return res.sendStatus(500)
      }
    }

    console.log('redirecting to signed URL', signedUrl)
    return res.redirect(signedUrl)
  })

  return router
}
