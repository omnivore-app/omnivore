import { IntegrationType } from '../generated/graphql'
import { env } from '../env'
import axios from 'axios'
import { wait } from '../utils/helpers'
import { Page } from '../elastic/types'
import { getHighlightLocation, getHighlightUrl } from './highlights'
import { Integration } from '../entity/integration'

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

export const READWISE_API_URL = 'https://readwise.io/api/v2'

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

const pageToReadwiseHighlight = (page: Page): ReadwiseHighlight[] => {
  if (!page.highlights) return []
  return page.highlights.map((highlight) => {
    const location = getHighlightLocation(highlight.patch)
    return {
      text: highlight.quote,
      title: page.title,
      author: page.author,
      highlight_url: getHighlightUrl(page.slug, highlight.id),
      highlighted_at: new Date(highlight.createdAt).toISOString(),
      category: 'articles',
      image_url: page.image,
      location,
      location_type: location ? 'page' : 'order',
      note: highlight.annotation || undefined,
      source_type: 'omnivore',
      source_url: page.url,
    }
  })
}

export const syncWithIntegration = async (
  integration: Integration,
  pages: Page[]
): Promise<boolean> => {
  let result = false
  switch (integration.type) {
    case IntegrationType.Readwise:
      result = await syncWithReadwise(
        integration.token,
        pages.flatMap(pageToReadwiseHighlight)
      )
      break
    default:
      return false
  }
  return result
}

export const syncWithReadwise = async (
  token: string,
  highlights: ReadwiseHighlight[],
  retryCount = 0
): Promise<boolean> => {
  const url = `${env.readwise.apiUrl || READWISE_API_URL}/highlights`
  try {
    const response = await axios.post(
      url,
      {
        highlights,
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
      const retryAfter = error.response?.headers['retry-after'] || '10' // default to 10 seconds
      await wait(parseInt(retryAfter, 10) * 1000)
      return syncWithReadwise(token, highlights, retryCount + 1)
    }
    console.log('Error creating highlights in Readwise', error)
    return false
  }
}
