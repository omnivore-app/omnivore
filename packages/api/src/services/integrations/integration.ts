import { LibraryItemState } from '../../entity/library_item'
import { ItemEvent } from '../library_item'

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
  token: string

  accessToken(): Promise<string | null>

  auth(state: string): Promise<string>

  export(items: ItemEvent[]): Promise<boolean>
}
