import { Integration } from '../../entity/integration'
import { Page } from '../../elastic/types'

export type RetrievedDataState = 'archived' | 'saved' | 'deleted'
export interface RetrievedData {
  url: string
  labels?: string[]
  state?: RetrievedDataState
}
export interface RetrievedResult {
  data: RetrievedData[]
  hasMore: boolean
}

export abstract class IntegrationService {
  abstract name: string

  accessToken = async (token: string): Promise<string | null> => {
    return Promise.resolve('')
  }
  export = async (
    integration: Integration,
    pages: Page[]
  ): Promise<boolean> => {
    return Promise.resolve(true)
  }
  retrieve = async (
    token: string,
    since = 0,
    count = 100,
    offset = 0
  ): Promise<RetrievedResult> => {
    return Promise.resolve({ data: [], hasMore: false })
  }
}
