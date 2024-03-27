import axios from 'axios'
import { HighlightType } from '../../entity/highlight'
import { logger } from '../../utils/logger'
import { getHighlightUrl } from '../highlights'
import { getItemUrl, ItemEvent } from '../library_item'
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
  token: string

  _headers = {
    'Content-Type': 'application/json',
  }
  _axios = axios.create({
    baseURL: 'https://readwise.io/api/v2',
    timeout: 5000, // 5 seconds
  })

  constructor(token: string) {
    this.token = token
  }

  accessToken = async (): Promise<string | null> => {
    try {
      const response = await this._axios.get('/auth', {
        headers: {
          ...this._headers,
          Authorization: `Token ${this.token}`,
        },
      })
      return response.status === 204 ? this.token : null
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(error.response)
      } else {
        logger.error(error)
      }
      return null
    }
  }

  export = async (items: ItemEvent[]): Promise<boolean> => {
    let result = true

    const highlights = items.flatMap(this._itemToReadwiseHighlight)

    // If there are no highlights, we will skip the sync
    if (highlights.length > 0) {
      result = await this._syncWithReadwise(highlights)
    }

    return result
  }

  auth = () => {
    throw new Error('Method not implemented.')
  }

  private _itemToReadwiseHighlight = (item: ItemEvent): ReadwiseHighlight[] => {
    const category = item.siteName === 'Twitter' ? 'tweets' : 'articles'

    return item.highlights
      ? item.highlights
          // filter out highlights that are not of type highlight or have no quote
          .filter(
            (highlight) => highlight.highlightType === HighlightType.Highlight
          )
          .map((highlight) => {
            return {
              text: highlight.quote || '',
              title: item.title,
              author: item.author || undefined,
              highlight_url: getHighlightUrl(item.id, highlight.id),
              highlighted_at: highlight.createdAt
                ? new Date(highlight.createdAt as string).toISOString()
                : undefined,
              category,
              image_url: item.thumbnail || undefined,
              location_type: 'order',
              note: highlight.annotation || undefined,
              source_type: 'omnivore',
              source_url: getItemUrl(item.id),
            }
          })
      : []
  }

  private _syncWithReadwise = async (
    highlights: ReadwiseHighlight[]
  ): Promise<boolean> => {
    const response = await this._axios.post(
      '/highlights',
      {
        highlights,
      },
      {
        headers: {
          ...this._headers,
          Authorization: `Token ${this.token}`,
        },
      }
    )
    return response.status === 200
  }
}
