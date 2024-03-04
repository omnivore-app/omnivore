import axios from 'axios'
import { env } from '../../env'
import { logger } from '../../utils/logger'
import { IntegrationClient } from './integration'

export class PocketClient implements IntegrationClient {
  name = 'POCKET'
  apiUrl = 'https://getpocket.com/v3'
  headers = {
    'Content-Type': 'application/json',
    'X-Accept': 'application/json',
  }

  accessToken = async (token: string): Promise<string | null> => {
    const url = `${this.apiUrl}/oauth/authorize`
    try {
      const response = await axios.post<{ access_token: string }>(
        url,
        {
          consumer_key: env.pocket.consumerKey,
          code: token,
        },
        {
          headers: this.headers,
          timeout: 5000, // 5 seconds
        }
      )
      return response.data.access_token
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(error.response)
      } else {
        logger.error(error)
      }
      return null
    }
  }

  export = () => {
    throw new Error('Method not implemented.')
  }

  async auth(state: string) {
    const consumerKey = env.pocket.consumerKey
    const redirectUri = `${env.client.url}/settings/integrations`

    // make a POST request to Pocket to get a request token
    const response = await axios.post<{ code: string }>(
      `${this.apiUrl}/oauth/request`,
      {
        consumer_key: consumerKey,
        redirect_uri: redirectUri,
      },
      {
        headers: this.headers,
        timeout: 5000, // 5 seconds
      }
    )
    const { code } = response.data

    return `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirectUri}${encodeURIComponent(
      `?pocketToken=${code}&state=${state}`
    )}`
  }
}
