import axios from 'axios'
import { LibraryItemState } from '../../entity/library_item'
import { env } from '../../env'
import { logger } from '../../utils/logger'
import {
  IntegrationService,
  RetrievedResult,
  RetrieveRequest,
} from './integration'

interface PocketResponse {
  status: number // 1 if success
  complete: number // 1 if all items have been returned
  list: {
    [key: string]: PocketItem
  }
  since: number // unix timestamp in seconds
  search_meta: {
    search_type: string
  }
  error: string
}

interface PocketItem {
  item_id: string
  resolved_id: string
  given_url: string
  resolved_url: string
  given_title: string
  resolved_title: string
  favorite: string
  status: string
  excerpt: string
  word_count: string
  tags?: {
    [key: string]: Tag
  }
  authors?: {
    [key: string]: Author
  }
}

interface Tag {
  item_id: string
  tag: string
}

interface Author {
  item_id: string
  author_id: string
  name: string
}

export class PocketIntegration extends IntegrationService {
  name = 'POCKET'
  POCKET_API_URL = 'https://getpocket.com/v3'
  headers = {
    'Content-Type': 'application/json',
    'X-Accept': 'application/json',
  }

  accessToken = async (token: string): Promise<string | null> => {
    const url = `${this.POCKET_API_URL}/oauth/authorize`
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

  retrievePocketData = async (
    accessToken: string,
    since: number, // unix timestamp in seconds
    count = 100,
    offset = 0
  ): Promise<PocketResponse | null> => {
    const url = `${this.POCKET_API_URL}/get`
    try {
      const response = await axios.post<PocketResponse>(
        url,
        {
          consumer_key: env.pocket.consumerKey,
          access_token: accessToken,
          state: 'all',
          detailType: 'complete',
          since,
          sort: 'oldest',
          count,
          offset,
        },
        {
          headers: this.headers,
          timeout: 10000, // 10 seconds
        }
      )

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(error.response)
      } else {
        logger.error(error)
      }

      return null
    }
  }

  retrieve = async ({
    token,
    since = 0,
    count = 100,
    offset = 0,
  }: RetrieveRequest): Promise<RetrievedResult> => {
    const pocketData = await this.retrievePocketData(
      token,
      since / 1000,
      count,
      offset
    )
    if (!pocketData) {
      throw new Error('Error retrieving pocket data')
    }

    const pocketItems = Object.values(pocketData.list)
    const statusToState: Record<string, LibraryItemState> = {
      '0': LibraryItemState.Succeeded,
      '1': LibraryItemState.Archived,
      '2': LibraryItemState.Deleted,
    }
    const data = pocketItems.map((item) => ({
      url: item.given_url,
      labels: item.tags
        ? Object.values(item.tags).map((tag) => tag.tag)
        : undefined,
      state: statusToState[item.status],
    }))

    if (pocketData.error) {
      throw new Error(`Error retrieving pocket data: ${pocketData.error}`)
    }

    return {
      data,
      since: pocketData.since * 1000,
    }
  }
}
