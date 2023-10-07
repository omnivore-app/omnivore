import axios from 'axios'
import { updateIntegration } from '.'
import { HighlightType } from '../../entity/highlight'
import { Integration } from '../../entity/integration'
import { LibraryItem } from '../../entity/library_item'
import { env } from '../../env'
import { wait } from '../../utils/helpers'
import { logger } from '../../utils/logger'
import { findHighlightsByLibraryItemId, getHighlightUrl } from '../highlights'
import { IntegrationService } from './integration'

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

export class ReadwiseIntegration extends IntegrationService {
  name = 'READWISE'
  accessToken = async (token: string): Promise<string | null> => {
    const authUrl = `${env.readwise.apiUrl || READWISE_API_URL}/auth`
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
  export = async (
    integration: Integration,
    items: LibraryItem[]
  ): Promise<boolean> => {
    let result = true

    const highlights = await Promise.all(
      items.map((item) => this.libraryItemToReadwiseHighlight(item))
    )
    // If there are no highlights, we will skip the sync
    if (highlights.length > 0) {
      result = await this.syncWithReadwise(integration.token, highlights.flat())
    }

    // update integration syncedAt if successful
    if (result) {
      logger.info('updating integration syncedAt')
      await updateIntegration(
        integration.id,
        {
          syncedAt: new Date(),
        },
        integration.user.id
      )
    }
    return result
  }

  libraryItemToReadwiseHighlight = async (
    item: LibraryItem
  ): Promise<ReadwiseHighlight[]> => {
    let highlights = item.highlights
    if (!highlights) {
      highlights = await findHighlightsByLibraryItemId(item.id, item.user.id)
    }

    const category = item.siteName === 'Twitter' ? 'tweets' : 'articles'
    return highlights
      .map((highlight) => {
        // filter out highlights that are not of type highlight or have no quote
        if (
          highlight.highlightType !== HighlightType.Highlight ||
          !highlight.quote
        ) {
          return undefined
        }

        return {
          text: highlight.quote,
          title: item.title,
          author: item.author || undefined,
          highlight_url: getHighlightUrl(item.slug, highlight.id),
          highlighted_at: new Date(highlight.createdAt).toISOString(),
          category,
          image_url: item.thumbnail || undefined,
          // location: highlight.highlightPositionAnchorIndex || undefined,
          location_type: 'order',
          note: highlight.annotation || undefined,
          source_type: 'omnivore',
          source_url: item.originalUrl,
        }
      })
      .filter((highlight) => highlight !== undefined) as ReadwiseHighlight[]
  }

  syncWithReadwise = async (
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
            'Content-Type': 'application/json',
          },
          timeout: 5000, // 5 seconds
        }
      )
      return response.status === 200
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429 && retryCount < 3) {
          logger.info('Readwise API rate limit exceeded, retrying...')
          // wait for Retry-After seconds in the header if rate limited
          // max retry count is 3
          const retryAfter = error.response?.headers['retry-after'] || '10' // default to 10 seconds
          await wait(parseInt(retryAfter, 10) * 1000)
          return this.syncWithReadwise(token, highlights, retryCount + 1)
        }

        logger.error(error.message)
      } else {
        logger.error(error)
      }

      return false
    }
  }
}
