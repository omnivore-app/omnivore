import express from 'express'
import { env } from '../../env'
import * as jwt from 'jsonwebtoken'
import { PageType, UploadFileStatus } from '../../generated/graphql'
import {
  generateUploadFilePathName,
  generateUploadSignedUrl,
  getStorageFileDetails,
  makeStorageFilePublic,
} from '../../utils/uploads'
import { initModels } from '../../server'
import { kx } from '../../datalayer/knex_config'
import { analytics } from '../../utils/analytics'
import normalizeUrl from 'normalize-url'

export function pdfAttachmentsRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/upload', async (req, res) => {
    console.log('pdf-attachments/upload')

    const { email, fileName } = req.body as {
      email: string
      fileName: string
    }

    const token = req?.headers?.authorization
    if (!token || !jwt.verify(token, env.server.jwtSecret)) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const models = initModels(kx, false)
    const user = await models.user.getWhere({ email })

    if (!user) {
      return res.status(401).send('UNAUTHORIZED')
    }

    analytics.track({
      userId: user.id,
      event: 'pdf-attachment-upload',
      properties: {
        env: env.server.apiEnv,
      },
    })

    const contentType = 'application/pdf'
    const uploadFileData = await models.uploadFile.create({
      url: '',
      userId: user.id,
      fileName: fileName,
      status: UploadFileStatus.Initialized,
      contentType: contentType,
    })

    if (uploadFileData.id) {
      const uploadFilePathName = generateUploadFilePathName(
        uploadFileData.id,
        fileName
      )
      const uploadSignedUrl = await generateUploadSignedUrl(
        uploadFilePathName,
        contentType
      )
      res.send({
        id: uploadFileData.id,
        url: uploadSignedUrl,
      })
    } else {
      res.status(400).send('BAD REQUEST')
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/create-article', async (req, res) => {
    console.log('pdf-attachments/create-article')

    const { email, uploadFileId } = req.body as {
      email: string
      uploadFileId: string
    }

    const token = req?.headers?.authorization
    if (!token || !jwt.verify(token, env.server.jwtSecret)) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const models = initModels(kx, false)
    const user = await models.user.getWhere({ email })

    if (!user) {
      return res.status(401).send('UNAUTHORIZED')
    }

    analytics.track({
      userId: user.id,
      event: 'pdf-attachment-create-article',
      properties: {
        env: env.server.apiEnv,
      },
    })

    const uploadFile = await models.uploadFile.getWhere({
      id: uploadFileId,
      userId: user.id,
    })
    if (!uploadFile) {
      return res.status(400).send('BAD REQUEST')
    }
    const uploadFileDetails = await getStorageFileDetails(
      uploadFileId,
      uploadFile.fileName
    )
    const uploadFileHash = uploadFileDetails.md5Hash
    const canonicalUrl = uploadFile.url
    const pageType = PageType.File

    const saveTime = new Date()
    const articleToSave = {
      url: normalizeUrl(canonicalUrl, {
        stripHash: true,
        stripWWW: false,
      }),
      pageType: pageType,
      hash: uploadFileHash,
      uploadFileId: uploadFileId,
      title: uploadFile.fileName,
      content: '',
    }

    const uploadFileData = await models.uploadFile.setFileUploadComplete(
      uploadFileId
    )
    if (!uploadFileData || !uploadFileData.id || !uploadFileData.fileName) {
      return res.status(400).send('BAD REQUEST')
    }

    const uploadFileUrlOverride = await makeStorageFilePublic(
      uploadFileData.id,
      uploadFileData.fileName
    )

    await kx.transaction(async (tx) => {
      const articleRecord = await models.article.create(articleToSave, tx)
      await models.userArticle.create(
        {
          userId: user.id,
          slug: '',
          savedAt: saveTime,
          articleId: articleRecord.id,
          articleUrl: uploadFileUrlOverride,
          articleHash: articleRecord.hash,
        },
        tx
      )
    })

    res.send('OK')
  })

  return router
}
