import { IntegrationService } from './integration'
import { Integration } from '../../entity/integration'
import axios from 'axios'
import { env } from '../../env'
import { DateTime } from 'luxon'
import { uploadToBucket } from '../../utils/uploads'
import { v4 as uuidv4 } from 'uuid'
import { getRepository } from '../../entity/utils'

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

  accessToken = async (token: string): Promise<string | null> => {
    const url = `${this.POCKET_API_URL}/oauth/authorize`
    try {
      const response = await axios.post<{ access_token: string }>(url, {
        consumer_key: env.pocket.consumerKey,
        code: token,
      })
      return response.data.access_token
    } catch (error) {
      console.log('error validating pocket token', error)
      return null
    }
  }

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

  import = async (integration: Integration): Promise<number> => {
    const syncAt = integration.syncedAt
      ? integration.syncedAt.getTime() / 1000
      : 0
    const pocketData = await this.retrievePocketData(integration.token, syncAt)
    const pocketItems = Object.values(pocketData.list)
    // write the list of urls to a csv file and upload it to gcs
    // path style: imports/<uid>/<date>/<type>-<uuid>.csv
    const dateStr = DateTime.now().toISODate()
    const fileUuid = uuidv4()
    const fullPath = `imports/${integration.user.id}/${dateStr}/URL_LIST-${fileUuid}.csv`
    const data = pocketItems.map((item) => item.given_url).join('\n')
    await uploadToBucket(fullPath, Buffer.from(data, 'utf-8'), {
      contentType: 'text/csv',
    })
    // update the integration's syncedAt
    await getRepository(Integration).update(integration.id, {
      syncedAt: new Date(),
    })
    return pocketItems.length
  }
}
