import { LibraryItem, LibraryItemState } from '../../entity/library_item'

export interface RetrievedData {
  url: string
  labels?: string[]
  state?: LibraryItemState
}
export interface RetrievedResult {
  data: RetrievedData[]
  hasMore?: boolean
  since?: number // unix timestamp in milliseconds
}

export interface RetrieveRequest {
  token: string
  since?: number // unix timestamp in milliseconds
  count?: number
  offset?: number
}

export interface IntegrationClient {
  name: string
  apiUrl: string

  accessToken(token: string): Promise<string | null>

  export(token: string, items: LibraryItem[]): Promise<boolean>
}
