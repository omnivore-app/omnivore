/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'
import { ContentDisplayReport } from '../../entity/reports/content_display_report'
import { env } from '../../env'
import { logger } from '../../utils/logger'
import { sendEmail } from '../../utils/sendEmail'

@EventSubscriber()
export class ContentDisplayReportSubscriber
  implements EntitySubscriberInterface<ContentDisplayReport>
{
  listenTo() {
    return ContentDisplayReport
  }

  async afterInsert(event: InsertEvent<ContentDisplayReport>): Promise<void> {
    const report = event.entity
    const message = `A new content display report was created by:
                    ${report.user.id} for URL: ${report.originalUrl}
                    ${report.reportComment}`

    // If we are in the local environment, just log a message, otherwise email the report
    if (env.dev.isLocal) {
      logger.info(message)
      return
    }

    await sendEmail({
      to: env.sender.feedback,
      subject: 'New content display report',
      text: message,
      from: env.sender.message,
    })
  }
}
