/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'

import { ContentDisplayReport } from '../../entity/reports/content_display_report'
import { env } from '../../env'
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
                    ${report.userId} for URL: ${report.originalUrl}
                    ${report.reportComment}`

    console.log(message)

    if (!env.dev.isLocal) {
      // If we are in the local environment, just log a message, otherwise email the report
      await sendEmail({
        to: env.sender.feedback,
        subject: 'New content display report',
        text: message,
        from: 'msgs@omnivore.app',
      })
    }
  }
}
