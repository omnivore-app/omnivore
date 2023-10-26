import { Item } from '../item'

export interface RetrievedData {
  url: string
  labels?: string[]
  state?: string
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

export abstract class IntegrationClient {
  abstract name: string
  abstract apiUrl: string
  highlightOnly = true

  export = async (token: string, items: Item[]): Promise<boolean> => {
    return Promise.resolve(false)
  }

  retrieve = async (req: RetrieveRequest): Promise<RetrievedResult> => {
    return Promise.resolve({ data: [] })
  }
}
