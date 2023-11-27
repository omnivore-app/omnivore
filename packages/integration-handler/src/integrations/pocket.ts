import axios from 'axios'
import {
  IntegrationClient,
  RetrievedResult,
  RetrieveRequest,
  State,
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

export class PocketClient extends IntegrationClient {
  name = 'POCKET'
  apiUrl = 'https://getpocket.com/v3'
  headers = {
    'Content-Type': 'application/json',
    'X-Accept': 'application/json',
  }

  retrievePocketData = async (
    accessToken: string,
    since: number, // unix timestamp in seconds
    count = 100,
    offset = 0,
    state = 'all'
  ): Promise<PocketResponse | null> => {
    const url = `${this.apiUrl}/get`
    try {
      const response = await axios.post<PocketResponse>(
        url,
        {
          consumer_key: process.env.POCKET_CONSUMER_KEY,
          access_token: accessToken,
          state,
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
      console.error('error retrievePocketData: ', error)

      return null
    }
  }

  retrieve = async ({
    token,
    since = 0,
    count = 100,
    offset = 0,
    state,
  }: RetrieveRequest): Promise<RetrievedResult> => {
    let pocketItemState = 'all'

    switch (state) {
      case State.ARCHIVED:
        pocketItemState = 'archive'
        break
      case State.UNREAD:
        pocketItemState = 'unread'
        break
    }

    const pocketData = await this.retrievePocketData(
      token,
      since / 1000,
      count,
      offset,
      pocketItemState
    )
    if (!pocketData) {
      throw new Error('Error retrieving pocket data')
    }

    const pocketItems = Object.values(pocketData.list)
    const statusToState: Record<string, State> = {
      '0': State.SUCCEEDED,
      '1': State.ARCHIVED,
      '2': State.DELETED,
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
