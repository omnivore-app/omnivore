import { getRepository } from 'typeorm'
import { ReportItemInput, ReportType } from '../generated/graphql'
import { ContentDisplayReport } from '../entity/reports/content_display_report'
import ArticleModel from '../datalayer/article'
import Knex from 'knex'
import { AbuseReport } from '../entity/reports/abuse_report'

export const saveContentDisplayReport = async (
  kx: Knex,
  uid: string,
  input: ReportItemInput
): Promise<boolean> => {
  const repo = getRepository(ContentDisplayReport)

  const am = new ArticleModel(kx)
  const article = await am.get(input.pageId)

  if (!article) {
    console.log('unable to submit report, article not found', input)
    return false
  }

  // We capture the article content and original html now, in case it
  // reparsed or updated later, this gives us a view of exactly
  // what the user saw.
  const result = await repo
    .create({
      userId: uid,
      pageId: input.pageId,
      content: article.content,
      originalHtml: article.originalHtml || undefined,
      originalUrl: article.url,
      reportComment: input.reportComment,
    })
    .save()

  return !!result
}

export const saveAbuseReport = async (
  kx: Knex,
  uid: string,
  input: ReportItemInput
): Promise<boolean> => {
  const repo = getRepository(AbuseReport)

  const am = new ArticleModel(kx)
  const article = await am.get(input.pageId)

  if (!article) {
    console.log('unable to submit report, article not found', input)
    return false
  }

  if (!input.sharedBy) {
    console.log('unable to submit report, sharedBy not found', input)
    return false
  }

  // We capture the article content and original html now, in case it
  // reparsed or updated later, this gives us a view of exactly
  // what the user saw.
  const result = await repo
    .create({
      reportedBy: uid,
      sharedBy: input.sharedBy,
      pageId: input.pageId,
      itemUrl: input.itemUrl,
      reportTypes: [ReportType.Abusive],
      reportComment: input.reportComment,
    })
    .save()

  return !!result
}
