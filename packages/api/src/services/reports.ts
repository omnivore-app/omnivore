import { AbuseReport } from '../entity/reports/abuse_report'
import { ContentDisplayReport } from '../entity/reports/content_display_report'
import { ReportItemInput, ReportType } from '../generated/graphql'
import { authTrx } from '../repository'
import { logger } from '../utils/logger'
import { findLibraryItemById } from './library_item'

export const saveContentDisplayReport = async (
  uid: string,
  input: ReportItemInput
): Promise<boolean> => {
  const item = await findLibraryItemById(input.pageId, uid)
  if (!item) {
    logger.info('unable to submit report, item not found', input)
    return false
  }

  // We capture the article content and original html now, in case it
  // reparsed or updated later, this gives us a view of exactly
  // what the user saw.
  const result = await authTrx((tx) =>
    tx.getRepository(ContentDisplayReport).save({
      user: { id: uid },
      content: item.readableContent,
      originalHtml: item.originalContent || undefined,
      originalUrl: item.originalUrl,
      reportComment: input.reportComment,
      libraryItemId: item.id,
    })
  )

  return !!result
}

export const saveAbuseReport = async (
  uid: string,
  input: ReportItemInput
): Promise<boolean> => {
  const item = await findLibraryItemById(input.pageId, uid)
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
