import axios from 'axios'
import { logger } from '../../utils/logger'
import { IntegrationClient } from './integration'

export class ReadwiseClient implements IntegrationClient {
  name = 'READWISE'
  apiUrl = 'https://readwise.io/api/v2'

  accessToken = async (token: string): Promise<string | null> => {
    const authUrl = `${this.apiUrl}/auth`
    try {
      const response = await axios.get(authUrl, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      return response.status === 204 ? token : null
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(error.response)
      } else {
        logger.error(error)
      }
      return null
    }
  }
}
