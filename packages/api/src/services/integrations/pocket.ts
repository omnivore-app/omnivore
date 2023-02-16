import { IntegrationService } from './integration'
import { Integration } from '../../entity/integration'
import axios from 'axios'
import { env } from '../../env'
import { PubSub } from '@google-cloud/pubsub'

interface PocketResponse {
  list: {
    [key: string]: PocketItem
  }
}

interface PocketItem {
  given_url: string
}

export class PocketIntegration extends IntegrationService {
  name = 'POCKET'
  POCKET_API_URL = 'https://getpocket.com/v3'
  IMPORT_TOPIC = 'importURL'

  retrievePocketData = async (
    accessToken: string,
    since: number
  ): Promise<PocketResponse> => {
    const url = `${this.POCKET_API_URL}/get`
    try {
      const response = await axios.post<PocketResponse>(url, {
        consumer_key: env.pocket.consumerKey,
        access_token: accessToken,
        state: 'all',
        detailType: 'simple',
        since,
      })
      return response.data
    } catch (error) {
      console.log('error retrieving pocket data', error)
      throw error
    }
  }

  import = async (integration: Integration): Promise<void> => {
    const syncAt = integration.syncedAt
      ? integration.syncedAt.getTime() / 1000
      : 0
    const pocketData = await this.retrievePocketData(integration.token, syncAt)
    const pocketItems = Object.values(pocketData.list)
    // publish pocket items to queue
    const client = new PubSub()
    await Promise.all(
      pocketItems.map((item) => {
        return client
          .topic(this.IMPORT_TOPIC)
          .publishMessage({
            data: JSON.stringify({
              url: item.given_url,
            }),
          })
          .catch((err) => {
            console.log('error publishing to pubsub', err)
            return undefined
          })
      })
    )
  }
}
