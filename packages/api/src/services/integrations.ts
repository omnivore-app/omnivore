import { IntegrationType } from '../generated/graphql'
import { env } from '../env'
import axios from 'axios'
import { wait } from '../utils/helpers'

export interface ReadwiseHighlight {
  text: string // The highlight text, (technically the only field required in a highlight object)
  title?: string // The title of the page the highlight is on
  author?: string // The author of the page the highlight is on
  image_url?: string // The URL of the page image
  source_url?: string // The URL of the page
  source_type?: string // A meaningful unique identifier for your app
  category?: string // One of: books, articles, tweets or podcasts
  note?: string // Annotation note attached to the specific highlight
  location?: number // Highlight's location in the source text. Used to order the highlights
  location_type?: string // One of: page, order or time_offset
  highlighted_at?: string // A datetime representing when the highlight was taken in the ISO 8601 format
  highlight_url?: string // Unique url of the specific highlight
}

const READWISE_API_URL = 'https://readwise.io/api/v2'

export const validateToken = async (
  token: string,
  type: IntegrationType
): Promise<boolean> => {
  switch (type) {
    case IntegrationType.Readwise:
      return validateReadwiseToken(token)
    default:
      return false
  }
}

const validateReadwiseToken = async (token: string): Promise<boolean> => {
  const authUrl = `${env.readwise.apiUrl || READWISE_API_URL}/auth`
  try {
    const response = await axios.get(authUrl, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    return response.status === 204
  } catch (error) {
    console.log('error validating readwise token', error)
    return false
  }
}

export const createHighlightsInReadwise = async (
  token: string,
  highlights: ReadwiseHighlight[],
  retryCount = 0
): Promise<boolean> => {
  const url = `${env.readwise.apiUrl || READWISE_API_URL}/highlights`
  try {
    const response = await axios.post(
      url,
      {
        highlights: highlights.map((highlight) => ({
          ...highlight,
          source_type: 'omnivore',
        })),
      },
      {
        headers: {
          Authorization: `Token ${token}`,
          ContentType: 'application/json',
        },
      }
    )
    return response.status === 200
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 429 &&
      retryCount < 3
    ) {
      console.log('Readwise API rate limit exceeded, retrying...')
      // wait for Retry-After seconds in the header if rate limited
      // max retry count is 3
      const retryAfter = error.response?.headers['Retry-After'] || '10' // default to 10 seconds
      await wait(parseInt(retryAfter, 10) * 1000)
      return createHighlightsInReadwise(token, highlights, retryCount + 1)
    }
    console.log('Error creating highlights in Readwise', error)
    return false
  }
}
