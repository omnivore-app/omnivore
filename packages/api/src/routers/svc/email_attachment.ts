import express from 'express'
import { createPubSubClient } from '../../datalayer/pubsub'
import { createPage } from '../../elastic/pages'
import { ArticleSavingRequestStatus, Page } from '../../elastic/types'
import { setClaims, uploadFileRepository } from '../../entity'
import { env } from '../../env'
import { PageType, UploadFileStatus } from '../../generated/graphql'
import { AppDataSource } from '../../server'
import { getNewsletterEmail } from '../../services/newsletters'
import { updateReceivedEmail } from '../../services/received_emails'
import { setFileUploadComplete } from '../../services/save_file'
import { analytics } from '../../utils/analytics'
import { getClaimsByToken } from '../../utils/auth'
import { generateSlug } from '../../utils/helpers'
import { logger } from '../../utils/logger'
import {
  generateUploadFilePathName,
  generateUploadSignedUrl,
  getStorageFileDetails,
  makeStorageFilePublic,
} from '../../utils/uploads'

export function emailAttachmentRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/upload', async (req, res) => {
    logger.info('email-attachment/upload')

    const { email, fileName, contentType } = req.body as {
      email: string
      fileName: string
      contentType: string
    }

    const token = req?.headers?.authorization
    if (!(await getClaimsByToken(token))) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const newsletterEmail = await getNewsletterEmail(email)
    if (!newsletterEmail || !newsletterEmail.user) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const user = newsletterEmail.user

    analytics.track({
      userId: user.id,
      event: 'email_attachment_upload',
      properties: {
        env: env.server.apiEnv,
      },
    })

    try {
      const uploadFileData = await uploadFileRepository.save({
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
    } catch (err) {
      logger.error(err)
      return res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/create-article', async (req, res) => {
    logger.info('email-attachment/create-article')

    const { email, uploadFileId, subject, receivedEmailId } = req.body as {
      email: string
      uploadFileId: string
      subject: string
      receivedEmailId: string
    }

    const token = req?.headers?.authorization
    if (!(await getClaimsByToken(token))) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const newsletterEmail = await getNewsletterEmail(email)
    if (!newsletterEmail || !newsletterEmail.user) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const user = newsletterEmail.user

    analytics.track({
      userId: user.id,
      event: 'email_attachment_create_article',
      properties: {
        env: env.server.apiEnv,
      },
    })

    try {
      const uploadFile = await uploadFileRepository.findOneBy({
        id: uploadFileId,
        user: { id: user.id },
      })
      if (!uploadFile) {
        return res.status(400).send('BAD REQUEST')
      }

      const uploadFileDetails = await getStorageFileDetails(
        uploadFileId,
        uploadFile.fileName
      )

      const uploadFileData = await AppDataSource.transaction(async (tx) => {
        await setClaims(tx, user.id)
        return setFileUploadComplete(uploadFileId, tx)
      })
      if (!uploadFileData || !uploadFileData.id || !uploadFileData.fileName) {
        return res.status(400).send('BAD REQUEST')
      }

      const uploadFileUrlOverride = await makeStorageFilePublic(
        uploadFileData.id,
        uploadFileData.fileName
      )

      const uploadFileHash = uploadFileDetails.md5Hash
      const pageType =
        uploadFile.contentType === 'application/pdf'
          ? PageType.File
          : PageType.Book
      const title = subject || uploadFileData.fileName
      const articleToSave: Page = {
        id: '',
        url: uploadFileUrlOverride,
        pageType,
        hash: uploadFileHash,
        uploadFileId,
        title,
        content: '',
        userId: user.id,
        slug: generateSlug(title),
        createdAt: new Date(),
        savedAt: new Date(),
        readingProgressPercent: 0,
        readingProgressAnchorIndex: 0,
        state: ArticleSavingRequestStatus.Succeeded,
      }

      const pageId = await createPage(articleToSave, {
        pubsub: createPubSubClient(),
        uid: user.id,
      })

      // update received email type
      await updateReceivedEmail(receivedEmailId, 'article')

      res.send({ id: pageId })
    } catch (err) {
      logger.info(err)
      res.status(500).send(err)
    }
  })

  return router
}
