import axios from 'axios'
import { ArticleSavingRequestStatus } from '../../elastic/types'
import { env } from '../../env'
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
        }
      )
      return response.data.access_token
    } catch (error) {
      console.log('error validating pocket token', error)
      return null
    }
  }

  retrievePocketData = async (
    accessToken: string,
    since: number, // unix timestamp in seconds
    count = 100,
    offset = 0
  ): Promise<PocketResponse> => {
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
        }
      )
      console.debug('pocket data', response.data)
      return response.data
    } catch (error) {
      console.log('error retrieving pocket data', error)
      throw new Error('Error retrieving pocket data')
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
    const pocketItems = Object.values(pocketData.list)
    const statusToState: Record<string, ArticleSavingRequestStatus> = {
      '0': ArticleSavingRequestStatus.Succeeded,
      '1': ArticleSavingRequestStatus.Archived,
      '2': ArticleSavingRequestStatus.Deleted,
    }
    const data = pocketItems.map((item) => ({
      url: item.given_url,
      labels: item.tags
        ? Object.values(item.tags).map((tag) => tag.tag)
        : undefined,
      state: statusToState[item.status],
    }))
    return {
      data,
      hasMore: pocketData.complete !== 1,
      since: pocketData.since * 1000,
    }
  }
}
