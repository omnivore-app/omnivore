import { Integration } from '../../entity/integration'
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

export abstract class IntegrationService {
  abstract name: string

  accessToken = async (token: string): Promise<string | null> => {
    return Promise.resolve(null)
  }
  export = async (
    integration: Integration,
    items: LibraryItem[]
  ): Promise<boolean> => {
    return Promise.resolve(false)
  }
  retrieve = async (req: RetrieveRequest): Promise<RetrievedResult> => {
    return Promise.resolve({ data: [] })
  }
}
