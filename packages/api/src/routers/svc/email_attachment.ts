import express from 'express'
import { ContentReaderType, LibraryItemState } from '../../entity/library_item'
import { UploadFile } from '../../entity/upload_file'
import { env } from '../../env'
import { PageType, UploadFileStatus } from '../../generated/graphql'
import { authTrx } from '../../repository'
import {
  createOrUpdateLibraryItem,
  CreateOrUpdateLibraryItemArgs,
} from '../../services/library_item'
import { findNewsletterEmailByAddress } from '../../services/newsletters'
import { updateReceivedEmail } from '../../services/received_emails'
import {
  findUploadFileById,
  setFileUploadComplete,
} from '../../services/upload_file'
import { analytics } from '../../utils/analytics'
import { getClaimsByToken } from '../../utils/auth'
import { generateSlug } from '../../utils/helpers'
import { logger } from '../../utils/logger'
import {
  generateUploadFilePathName,
  generateUploadSignedUrl,
  getStorageFileDetails,
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

    const newsletterEmail = await findNewsletterEmailByAddress(email)
    if (!newsletterEmail || !newsletterEmail.user) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const user = newsletterEmail.user

    analytics.capture({
      distinctId: user.id,
      event: 'email_attachment_upload',
      properties: {
        env: env.server.apiEnv,
      },
    })

    try {
      const uploadFileData = await authTrx(
        (tx) =>
          tx.getRepository(UploadFile).save({
            url: '',
            fileName,
            status: UploadFileStatus.Initialized,
            contentType,
            user: { id: user.id },
          }),
        {
          uid: user.id,
        }
      )

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

    const newsletterEmail = await findNewsletterEmailByAddress(email)
    if (!newsletterEmail || !newsletterEmail.user) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const user = newsletterEmail.user

    analytics.capture({
      distinctId: user.id,
      event: 'email_attachment_create_article',
      properties: {
        env: env.server.apiEnv,
      },
    })

    try {
      const uploadFile = await findUploadFileById(uploadFileId)
      if (!uploadFile) {
        return res.status(400).send('BAD REQUEST')
      }

      const uploadFileDetails = await getStorageFileDetails(
        uploadFileId,
        uploadFile.fileName
      )

      const uploadFileData = await setFileUploadComplete(uploadFileId, user.id)
      if (!uploadFileData || !uploadFileData.id || !uploadFileData.fileName) {
        return res.status(400).send('BAD REQUEST')
      }

      const uploadFilePathName = generateUploadFilePathName(
        uploadFileId,
        uploadFile.fileName
      )

      const uploadFileUrlOverride = `https://omnivore.app/attachments/${uploadFilePathName}`
      const uploadFileHash = uploadFileDetails.md5Hash
      const itemType =
        uploadFile.contentType === 'application/pdf'
          ? PageType.File
          : PageType.Book
      const title = subject || uploadFileData.fileName
      const itemToCreate: CreateOrUpdateLibraryItemArgs = {
        originalUrl: uploadFileUrlOverride,
        itemType,
        textContentHash: uploadFileHash,
        uploadFile: { id: uploadFileData.id },
        title,
        readableContent: '',
        slug: generateSlug(title),
        state: LibraryItemState.Succeeded,
        user: { id: user.id },
        contentReader:
          itemType === PageType.File
            ? ContentReaderType.PDF
            : ContentReaderType.EPUB,
      }

      const item = await createOrUpdateLibraryItem(itemToCreate, user.id)

      // update received email type
      await updateReceivedEmail(receivedEmailId, 'article', user.id)

      res.send({ id: item.id })
    } catch (err) {
      logger.info(err)
      res.status(500).send(err)
    }
  })

  return router
}
