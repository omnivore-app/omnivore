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

  export = async (): Promise<boolean> => {
    return Promise.resolve(false)
  }
}
