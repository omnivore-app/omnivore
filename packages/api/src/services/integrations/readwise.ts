import axios from 'axios'
import { LibraryItem } from '../../entity/library_item'
import { highlightUrl } from '../../utils/helpers'
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

  export = async (token: string, items: LibraryItem[]): Promise<boolean> => {
    let result = true

    const highlights = items.flatMap(this.itemToReadwiseHighlight)

    // If there are no highlights, we will skip the sync
    if (highlights.length > 0) {
      result = await this.syncWithReadwise(token, highlights)
    }

    return result
  }

  itemToReadwiseHighlight = (item: LibraryItem): ReadwiseHighlight[] => {
    const category = item.siteName === 'Twitter' ? 'tweets' : 'articles'
    return item.highlights
      ?.map((highlight) => {
        // filter out highlights that are not of type highlight or have no quote
        if (highlight.highlightType !== 'HIGHLIGHT' || !highlight.quote) {
          return undefined
        }

        return {
          text: highlight.quote,
          title: item.title,
          author: item.author || undefined,
          highlight_url: highlightUrl(item.slug, highlight.id),
          highlighted_at: new Date(highlight.createdAt).toISOString(),
          category,
          image_url: item.thumbnail || undefined,
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
    highlights: ReadwiseHighlight[]
  ): Promise<boolean> => {
    const url = `${this.apiUrl}/highlights`
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
  }
}
