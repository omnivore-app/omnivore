import axios from 'axios'
import { logger } from '../../utils/logger'
import { IntegrationClient } from './integration'

interface ReadwiseHighlight {
  // The highlight text, (technically the only field required in a highlight object)
  text: string
  // The title of the page the highlight is on
  title?: string
  // The author of the page the highlight is on
  author?: string
  // The URL of the page image
  image_url?: string
  // The URL of the page
  source_url?: string
  // A meaningful unique identifier for your app
  source_type?: string
  // One of: books, articles, tweets or podcasts
  category?: string
  // Annotation note attached to the specific highlight
  note?: string
  // Highlight's location in the source text. Used to order the highlights
  location?: number
  // One of: page, order or time_offset
  location_type?: string
  // A datetime representing when the highlight was taken in the ISO 8601 format
  highlighted_at?: string
  // Unique url of the specific highlight
  highlight_url?: string
}

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
