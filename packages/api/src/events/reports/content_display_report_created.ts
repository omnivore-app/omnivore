/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios from 'axios'

import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'

import { ContentDisplayReport } from '../../entity/reports/content_display_report'
import { env } from '../../env'

@EventSubscriber()
export class ContentDisplayReportSubscriber
  implements EntitySubscriberInterface<ContentDisplayReport>
{
  listenTo() {
    return ContentDisplayReport
  }

  async afterInsert(event: InsertEvent<ContentDisplayReport>): Promise<void> {
    const report = event.entity
    const message = `A new content display report was created by ${report.userId} for URL': ${report.originalUrl}: ${report.reportComment}`

    console.log(message)

    if (!env.dev.isLocal) {
      // If we are in the local environment, just log a message, otherwise send to discord
      const discordUrl =
        'https://discord.com/api/webhooks/866028072263745576/DtTCjyQmOi9D0_7nKOFdB4Iucb7ml3lv_zBrEF84sOhwJCxrojZFbiW89s8OELCaPDEo'

      await axios({
        method: 'post',
        url: discordUrl,
        data: {
          content: message,
        },
      })
    }
  }
}
