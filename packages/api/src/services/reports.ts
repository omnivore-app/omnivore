import { AbuseReport } from '../entity/reports/abuse_report'
import { ContentDisplayReport } from '../entity/reports/content_display_report'
import { env } from '../env'
import { ReportItemInput, ReportType } from '../generated/graphql'
import { authTrx, getRepository } from '../repository'
import { logger } from '../utils/logger'
import { sendEmail } from '../utils/sendEmail'
import { findLibraryItemById } from './library_item'

export const saveContentDisplayReport = async (
  uid: string,
  input: ReportItemInput
): Promise<boolean> => {
  const item = await findLibraryItemById(input.pageId, uid, {
    select: ['id', 'readableContent', 'originalUrl'],
  })
  if (!item) {
    logger.info('unable to submit report, item not found', input)
    return false
  }

  // We capture the article content and original html now, in case it
  // reparsed or updated later, this gives us a view of exactly
  // what the user saw.
  const report = await getRepository(ContentDisplayReport).save({
    user: { id: uid },
    content: item.readableContent,
    originalUrl: item.originalUrl,
    reportComment: input.reportComment,
    libraryItemId: item.id,
  })

  const message = `A new content display report was created by:
                  ${report.user.id} for URL: ${report.originalUrl}
                  ${report.reportComment}`

  // If we are in the local environment, just log a message, otherwise email the report
  if (env.dev.isLocal) {
    logger.info(message)
    return !!report
  }

  await sendEmail({
    to: env.sender.feedback,
    subject: 'New content display report',
    text: message,
    from: env.sender.message,
  })

  return !!report
}

export const saveAbuseReport = async (
  uid: string,
  input: ReportItemInput
): Promise<boolean> => {
  const item = await findLibraryItemById(input.pageId, uid, {
    select: ['id'],
  })
  if (!item) {
    logger.info('unable to submit report, item not found', input)
    return false
  }

  if (!input.sharedBy) {
    logger.info('unable to submit report, sharedBy not found', input)
    return false
  }

  // We capture the article content and original html now, in case it
  // reparsed or updated later, this gives us a view of exactly
  // what the user saw.
  const result = await authTrx((tx) =>
    tx.getRepository(AbuseReport).save({
      reportedBy: uid,
      sharedBy: input.sharedBy || undefined,
      itemUrl: input.itemUrl,
      reportTypes: [ReportType.Abusive],
      reportComment: input.reportComment,
      libraryItemId: item.id,
    })
  )

  return !!result
}
