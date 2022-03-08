// Define the type of the body for the Search request
import { Label, PageType } from '../generated/graphql'
import { PickTuple } from '../util'

export interface SearchBody {
  query: {
    bool: {
      filter: (
        | {
            term: {
              userId: string
            }
          }
        | { term: { pageType: string } }
        | { exists: { field: string } }
        | {
            range: {
              readingProgress: { gte: number } | { lt: number }
            }
          }
        | {
            nested: {
              path: 'labels'
              query: {
                bool: {
                  filter: {
                    terms: {
                      'labels.name': string[]
                    }
                  }[]
                }
              }
            }
          }
      )[]
      should: {
        multi_match: {
          query: string
          fields: string[]
          operator: 'and' | 'or'
          type:
            | 'best_fields'
            | 'most_fields'
            | 'cross_fields'
            | 'phrase'
            | 'phrase_prefix'
        }
      }[]
      minimum_should_match?: number
      must_not: (
        | {
            exists: {
              field: string
            }
          }
        | {
            nested: {
              path: 'labels'
              query: {
                terms: {
                  'labels.name': string[]
                }
              }[]
            }
          }
      )[]
    }
  }
  sort: [
    {
      savedAt: {
        order: string
      }
    },
    {
      createdAt: {
        order: string
      }
    },
    '_score'
  ]
  from: number
  size: number
}

// Complete definition of the Search response
export interface ShardsResponse {
  total: number
  successful: number
  failed: number
  skipped: number
}

export interface Explanation {
  value: number
  description: string
  details: Explanation[]
}

export interface SearchResponse<T> {
  took: number
  timed_out: boolean
  _scroll_id?: string
  _shards: ShardsResponse
  hits: {
    total: {
      value: number
    }
    max_score: number
    hits: Array<{
      _index: string
      _type: string
      _id: string
      _score: number
      _source: T
      _version?: number
      _explanation?: Explanation
      fields?: never
      highlight?: never
      inner_hits?: never
      matched_queries?: string[]
      sort?: string[]
    }>
  }
  aggregations?: never
}

export interface Page {
  id: string
  userId: string
  title: string
  author?: string
  description?: string
  content: string
  url: string
  hash: string
  uploadFileId?: string | null
  image?: string
  pageType: PageType
  originalHtml?: string | null
  slug: string
  labels?: Label[]
  readingProgressPercent?: number
  readingProgressAnchorIndex?: number
  createdAt: Date
  updatedAt?: Date
  publishedAt?: Date
  savedAt?: Date
  sharedAt?: Date
  archivedAt?: Date | null
  siteName?: string
  _id?: string
}

const keys = ['_id', 'url', 'slug'] as const

export type ParamSet = PickTuple<Page, typeof keys>
