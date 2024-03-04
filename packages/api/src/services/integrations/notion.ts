import axios from 'axios'
import { env } from '../../env'
import { logger } from '../../utils/logger'
import { IntegrationClient } from './integration'

export class NotionClient implements IntegrationClient {
  name = 'notion'
  apiUrl = 'https://api.notion.com/v1'
  headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  accessToken = async (code: string): Promise<string | null> => {
    const authUrl = `${this.apiUrl}/oauth/token`
    try {
      // encode in base 64
      const encoded = Buffer.from(
        `${env.notion.clientId}:${env.notion.clientSecret}`
      ).toString('base64')

      const response = await axios.post<{ access_token: string }>(
        authUrl,
        {
          grant_type: 'authorization_code',
          code,
        },
        {
          headers: {
            authorization: `Basic ${encoded}`,
            ...this.headers,
          },
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

  async auth(state: string): Promise<string> {
    return Promise.resolve(env.notion.authUrl)
  }

  export = () => {
    throw new Error('Method not implemented.')
  }
}
