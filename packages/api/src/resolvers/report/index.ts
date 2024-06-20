/* eslint-disable @typescript-eslint/no-floating-promises */
import { env } from '../../env'
import {
  MutationReportItemArgs,
  ReportItemResult,
  ReportType,
  ResolverFn,
} from '../../generated/graphql'
import {
  saveAbuseReport,
  saveContentDisplayReport,
} from '../../services/reports'
import { analytics } from '../../utils/analytics'
import { ResolverContext } from '../types'

const SUCCESS_MESSAGE = `Your report has been submitted. Thank you.`
const FAILURE_MESSAGE =
  'There was an error submitting your report. If this issue persists please use email or the feedback tool.'

const isAbuseReport = (types: ReportType[]): boolean => {
  // If the list contains any types other than ReportType.Content
  // it is an abuse report.
  if (types.length == 1 && types[0] == ReportType.ContentDisplay) {
    return false
  }
  return true
}

const isContentDisplayReport = (types: ReportType[]): boolean => {
  if (types.length == 1 && types[0] == ReportType.ContentDisplay) {
    return true
  }
  return false
}

export const reportItemResolver: ResolverFn<
  ReportItemResult,
  unknown,
  ResolverContext,
  MutationReportItemArgs
> = async (_obj, args, ctx) => {
  const { sharedBy, reportTypes } = args.input

  if (sharedBy && isAbuseReport(reportTypes)) {
    analytics.capture({
      distinctId: sharedBy,
      event: 'report_created',
      properties: {
        type: 'abuse',
        env: env.server.apiEnv,
      },
    })

    // SharedBy is nullable for some report types, but not for abuse reports
    // So we force it
    const uid = ctx.claims?.uid || ''
    const value = { sharedBy: uid, reportedBy: uid, ...args.input }

    const report = await saveAbuseReport(uid, value)
    const message = report ? SUCCESS_MESSAGE : FAILURE_MESSAGE
    return {
      message: message,
    }
  } else if (isContentDisplayReport(reportTypes)) {
    // Content Display messages require a uid, since only users can see content
    const uid = ctx.claims?.uid
    if (!uid) {
      return {
        message: FAILURE_MESSAGE,
      }
    }

    analytics.capture({
      distinctId: uid,
      event: 'report_created',
      properties: {
        type: 'content',
        url: args.input.itemUrl,
        env: env.server.apiEnv,
      },
    })

    const report = await saveContentDisplayReport(uid, args.input)
    const message = report ? SUCCESS_MESSAGE : FAILURE_MESSAGE
    return {
      message: message,
    }
  }

  return {
    message: FAILURE_MESSAGE,
  }
}
