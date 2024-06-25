import { gql } from 'graphql-request'

export const articleFragment = gql`
  fragment ArticleFields on Article {
    id
    title
    url
    author
    image
    savedAt
    createdAt
    publishedAt
    contentReader
    originalArticleUrl
    readingProgressPercent
    readingProgressTopPercent
    readingProgressAnchorIndex
    slug
    folder
    isArchived
    description
    linkId
    state
    wordsCount
  }
`

export type ContentReader = 'WEB' | 'PDF' | 'EPUB'

export enum State {
  SUCCEEDED = 'SUCCEEDED',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
  ARCHIVED = 'ARCHIVED',
}

export enum PageType {
  ARTICLE = 'ARTICLE',
  BOOK = 'BOOK',
  FILE = 'FILE',
  PROFILE = 'PROFILE',
  WEBSITE = 'WEBSITE',
  HIGHLIGHTS = 'HIGHLIGHTS',
  UNKNOWN = 'UNKNOWN',
}

export type ArticleFragmentData = {
  id: string
  title: string
  url: string
  author?: string
  image?: string
  savedAt: string
  createdAt: string
  publishedAt?: string
  contentReader?: ContentReader
  originalArticleUrl: string
  readingProgressPercent: number
  readingProgressTopPercent?: number
  readingProgressAnchorIndex: number
  slug: string
  isArchived: boolean
  description: string
  linkId?: string
  state?: State
}
