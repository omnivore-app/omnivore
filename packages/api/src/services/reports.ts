import { getPageById } from '../elastic/pages'
import { AbuseReport } from '../entity/reports/abuse_report'
import { ContentDisplayReport } from '../entity/reports/content_display_report'
import { ReportItemInput, ReportType } from '../generated/graphql'
import { getRepository } from '../repository'
import { logger } from '../utils/logger'
import { findLibraryItemById } from './library_item'

export const saveContentDisplayReport = async (
  uid: string,
  input: ReportItemInput
): Promise<boolean> => {
  const page = await findLibraryItemById(input.pageId)

  if (!page) {
    logger.info('unable to submit report, page not found', input)
    return false
  }

  // We capture the article content and original html now, in case it
  // reparsed or updated later, this gives us a view of exactly
  // what the user saw.
  const result = await repo.save({
    user: { id: uid },
    content: page.content,
    originalHtml: page.originalHtml || undefined,
    originalUrl: page.url,
    reportComment: input.reportComment,
  })

  return !!result
}

export const saveAbuseReport = async (
  uid: string,
  input: ReportItemInput
): Promise<boolean> => {
  const repo = getRepository(AbuseReport)

  const page = await getPageById(input.pageId)

  if (!page) {
    logger.info('unable to submit report, page not found', input)
    return false
  }

  if (!input.sharedBy) {
    logger.info('unable to submit report, sharedBy not found', input)
    return false
  }

  // We capture the article content and original html now, in case it
  // reparsed or updated later, this gives us a view of exactly
  // what the user saw.
  const result = await repo.save({
    reportedBy: uid,
    sharedBy: input.sharedBy,
    elasticPageId: input.pageId,
    itemUrl: input.itemUrl,
    reportTypes: [ReportType.Abusive],
    reportComment: input.reportComment,
  })

  return !!result
}
