// Define the type of the body for the Search request
import { PickTuple } from '../util'
import { PubsubClient } from '../datalayer/pubsub'

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
        | {
            nested: {
              path: 'highlights'
              query: {
                exists: {
                  field: 'highlights'
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
  sort: [Record<string, { order: string }>]
  from: number
  size: number
  _source: {
    excludes: string[]
  }
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
      inner_hits?: any
      matched_queries?: string[]
      sort?: string[]
    }>
  }
  aggregations?: never
}

export enum PageType {
  Article = 'ARTICLE',
  Book = 'BOOK',
  File = 'FILE',
  Profile = 'PROFILE',
  Unknown = 'UNKNOWN',
  Website = 'WEBSITE',
  Highlights = 'HIGHLIGHTS',
}

export interface Label {
  id: string
  name: string
  color: string
  description?: string
  createdAt?: Date
}

export interface Highlight {
  id: string
  shortId: string
  patch: string
  quote: string
  userId: string
  createdAt: Date
  prefix?: string | null
  suffix?: string | null
  annotation?: string | null
  sharedAt?: Date | null
  updatedAt?: Date | null
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
  readingProgressPercent: number
  readingProgressAnchorIndex: number
  createdAt: Date
  updatedAt?: Date
  publishedAt?: Date
  savedAt?: Date
  sharedAt?: Date
  archivedAt?: Date | null
  siteName?: string
  _id?: string
  siteIcon?: string
}

export interface SearchItem {
  annotation?: string | null
  author?: string | null
  createdAt: Date
  description?: string | null
  id: string
  image?: string | null
  pageId?: string
  pageType: PageType
  publishedAt?: Date
  quote?: string | null
  shortId?: string | null
  slug: string
  title: string
  uploadFileId?: string | null
  url: string
  archivedAt?: Date | null
}

const keys = ['_id', 'url', 'slug', 'userId', 'uploadFileId'] as const

export type ParamSet = PickTuple<Page, typeof keys>

export interface PageContext {
  pubsub: PubsubClient
  refresh?: boolean
  uid: string
}
