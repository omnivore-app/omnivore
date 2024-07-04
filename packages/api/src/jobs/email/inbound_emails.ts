import { handleNewsletter } from '@omnivore/content-handler'
import { Converter } from 'showdown'
import { ContentReaderType, LibraryItemState } from '../../entity/library_item'
import { SubscriptionStatus } from '../../entity/subscription'
import { UploadFile } from '../../entity/upload_file'
import { env } from '../../env'
import { PageType, UploadFileStatus } from '../../generated/graphql'
import { authTrx } from '../../repository'
import { createOrUpdateLibraryItem } from '../../services/library_item'
import {
  findNewsletterEmailByAddress,
  updateConfirmationCode,
} from '../../services/newsletters'
import {
  saveReceivedEmail,
  updateReceivedEmail,
} from '../../services/received_emails'
import { saveNewsletter } from '../../services/save_newsletter_email'
import { saveUrlFromEmail } from '../../services/save_url'
import { getSubscriptionByName } from '../../services/subscriptions'
import { analytics } from '../../utils/analytics'
import { enqueueSendEmail } from '../../utils/createTask'
import { generateSlug, isUrl } from '../../utils/helpers'
import { logger } from '../../utils/logger'
import {
  parseEmailAddress,
  isProbablyArticle,
  getTitleFromEmailSubject,
  generateUniqueUrl,
} from '../../utils/parser'
import {
  generateUploadFilePathName,
  getStorageFileDetails,
} from '../../utils/uploads'

interface EmailJobData {
  from: string
  to: string
  subject: string
  html: string
  text: string
  headers: Record<string, string | string[]>
  unsubMailTo?: string
  unsubHttpUrl?: string
  forwardedFrom?: string
  replyTo?: string
  confirmationCode?: string
  uploadFile?: {
    fileName: string
    contentType: string
    id: string
  }
}

const converter = new Converter()
export const FORWARD_EMAIL_JOB = 'forward-email'
export const SAVE_NEWSLETTER_JOB = 'save-newsletter'
export const CONFIRM_EMAIL_JOB = 'confirmation-email'
export const SAVE_ATTACHMENT_JOB = 'save-attachment'

export const plainTextToHtml = (text: string): string => {
  return converter.makeHtml(text)
}

export const forwardEmailJob = async (data: EmailJobData) => {
  const { from, to, subject, html, text, replyTo, forwardedFrom } = data

  // get user from newsletter email
  const newsletterEmail = await findNewsletterEmailByAddress(to)

  if (!newsletterEmail) {
    logger.error(`newsletter email not found: ${to}`)
    return false
  }

  const user = newsletterEmail.user
  const parsedFrom = parseEmailAddress(from)

  const { id: receivedEmailId } = await saveReceivedEmail(
    from,
    to,
    subject,
    text,
    html,
    user.id,
    'non-article',
    replyTo
  )

  if (
    await isProbablyArticle(
      forwardedFrom || parsedFrom.address || from,
      subject
    )
  ) {
    logger.info('handling as article')
    return saveNewsletter(
      {
        title: getTitleFromEmailSubject(subject),
        author: parsedFrom.name || from,
        url: generateUniqueUrl(),
        content: html || text,
        receivedEmailId,
        email: newsletterEmail.address,
      },
      newsletterEmail
    )
  }

  analytics.capture({
    distinctId: user.id,
    event: 'non_newsletter_email_received',
    properties: {
      env: env.server.apiEnv,
    },
  })

  // forward non-newsletter emails to the registered email address
  const result = await enqueueSendEmail({
    from: env.sender.message,
    to: user.email,
    subject: `Fwd: ${subject}`,
    html,
    text,
    replyTo: replyTo || from,
  })

  return !!result
}

export const saveNewsletterJob = async (data: EmailJobData) => {
  const {
    from,
    to,
    subject,
    html,
    text,
    replyTo,
    headers,
    unsubMailTo,
    unsubHttpUrl,
  } = data

  // get user from newsletter email
  const newsletterEmail = await findNewsletterEmailByAddress(to)
  if (!newsletterEmail) {
    logger.error(`newsletter email not found: ${to}`)

    return false
  }

  const user = newsletterEmail.user
  const { id: receivedEmailId } = await saveReceivedEmail(
    from,
    to,
    subject,
    text,
    html,
    user.id,
    'non-article', // default to non-article
    replyTo
  )

  if (isUrl(subject)) {
    // save url if the title is a parsable url
    const result = await saveUrlFromEmail(
      subject,
      receivedEmailId,
      newsletterEmail.user.id
    )

    if (result) {
      // update received email type
      await updateReceivedEmail(receivedEmailId, 'article', user.id)
    }

    return result
  }

  // convert text to html if html is not available
  const content = html || plainTextToHtml(text)
  const newsletter = await handleNewsletter({
    from,
    to,
    subject,
    html: content,
    headers,
  })

  const parsedFrom = parseEmailAddress(from)
  const author = parsedFrom.name || from

  // do not subscribe if subscription already exists and is unsubscribed
  const existingSubscription = await getSubscriptionByName(
    author,
    newsletterEmail.user.id
  )
  if (existingSubscription?.status === SubscriptionStatus.Unsubscribed) {
    logger.info(`newsletter already unsubscribed: ${from}`)
    return false
  }

  // save newsletter instead
  return saveNewsletter(
    {
      email: newsletterEmail.address,
      content,
      url: generateUniqueUrl(),
      title: subject,
      author,
      unsubMailTo,
      unsubHttpUrl,
      receivedEmailId,
      ...newsletter,
    },
    newsletterEmail
  )
}

export const saveAttachmentJob = async (data: EmailJobData) => {
  const { from, to, subject, html, text, replyTo, uploadFile } = data

  // get user from newsletter email
  const newsletterEmail = await findNewsletterEmailByAddress(to)
  if (!newsletterEmail) {
    logger.error(`newsletter email not found: ${to}`)

    return false
  }

  const user = newsletterEmail.user
  const receivedEmail = await saveReceivedEmail(
    from,
    to,
    subject,
    text,
    html,
    user.id,
    'non-article',
    replyTo
  )

  const uploadFileData = await authTrx(
    (tx) =>
      tx.getRepository(UploadFile).save({
        ...uploadFile,
        url: '', // no url for email attachments
        status: UploadFileStatus.Completed,
        user: { id: user.id },
      }),
    {
      uid: user.id,
    }
  )

  const uploadFileDetails = await getStorageFileDetails(
    uploadFileData.id,
    uploadFileData.fileName
  )

  const uploadFilePathName = generateUploadFilePathName(
    uploadFileData.id,
    uploadFileData.fileName
  )

  const uploadFileUrlOverride = `https://omnivore.app/attachments/${uploadFilePathName}`
  const uploadFileHash = uploadFileDetails.md5Hash
  const itemType =
    uploadFileData.contentType === 'application/pdf'
      ? PageType.File
      : PageType.Book
  const title = subject || uploadFileData.fileName
  const itemToCreate = {
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

  await createOrUpdateLibraryItem(itemToCreate, user.id)

  // update received email type
  await updateReceivedEmail(receivedEmail.id, 'article', user.id)

  return true
}

export const confirmEmailJob = async (data: EmailJobData) => {
  const { confirmationCode, to } = data
  if (!confirmationCode) {
    logger.error('confirmation code not provided')
    return false
  }

  return updateConfirmationCode(to, confirmationCode)
}
