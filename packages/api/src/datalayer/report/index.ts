import Knex from 'knex'
import { ReportType } from '../../generated/graphql'

interface ReportItem {
  pageId: string
  itemUrl: string

  sharedBy: string
  reportedBy: string | undefined

  reportTypes: ReportType[]
  reportComment: string
}

// Returns the ID of the report
export const createAbuseReport = async (
  tx: Knex,
  reportedBy: string | undefined,
  input: ReportItem
): Promise<string> => {
  const report = { ...input, reportedBy }
  const result: string[] = await tx<ReportItem>(
    'omnivore.abuse_reports'
  ).insert(report, ['id'])

  if (!result || result.length !== 1) {
    throw new Error('Unable to create abuse report.')
  }

  return result[0]
}
