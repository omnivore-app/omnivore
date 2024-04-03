import axios from 'axios'
import { env } from '../../env'
import { logger } from '../../utils/logger'
import { IntegrationClient } from './integration'

export class PocketClient implements IntegrationClient {
  name = 'POCKET'
  token: string
  _axios = axios.create({
    baseURL: 'https://getpocket.com/v3',
    headers: {
      'Content-Type': 'application/json',
      'X-Accept': 'application/json',
    },
    timeout: 5000, // 5 seconds
  })

  constructor(token: string) {
    this.token = token
  }

  accessToken = async (): Promise<string | null> => {
    try {
      const response = await this._axios.post<{ access_token: string }>(
        '/oauth/authorize',
        {
          consumer_key: env.pocket.consumerKey,
          code: this.token,
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
    const response = await this._axios.post<{ code: string }>(
      '/oauth/request',
      {
        consumer_key: consumerKey,
        redirect_uri: redirectUri,
      }
    )
    const { code } = response.data

    return `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirectUri}${encodeURIComponent(
      `?pocketToken=${code}&state=${state}`
    )}`
  }
}
