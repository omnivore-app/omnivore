import { State } from '../fragments/articleFragment'

export interface ReadableItem {
  id: string
  title: string
  slug: string
}

export type LibraryItemsQueryInput = {
  limit: number
  sortDescending: boolean
  searchQuery?: string
  cursor?: string
  includeContent?: boolean
}

export type LibraryItemsData = {
  search: LibraryItems
  errorCodes?: string[]
}

export type LibraryItems = {
  edges: LibraryItem[]
  pageInfo: PageInfo
  errorCodes?: string[]
}

export type LibraryItem = {
  cursor: string
  node: LibraryItemNode
  isLoading?: boolean | undefined
}

export type LibraryItemNode = {
  id: string
  title: string
  url: string
  author?: string
  image?: string
  createdAt: string
  publishedAt?: string
  contentReader?: ContentReader
  originalArticleUrl: string
  readingProgressPercent: number
  readingProgressTopPercent?: number
  readingProgressAnchorIndex: number
  slug: string
  folder?: string
  isArchived: boolean
  description: string
  ownedByViewer: boolean
  uploadFileId: string
  labels?: Label[]
  pageId: string
  shortId: string
  quote: string
  annotation: string
  state: State
  pageType: PageType
  siteName?: string
  siteIcon?: string
  subscription?: string
  readAt?: string
  savedAt?: string
  wordsCount?: number
  aiSummary?: string
  recommendations?: Recommendation[]
  highlights?: Highlight[]
}

export type Recommendation = {
  id: string
  name: string
  note?: string
  user?: RecommendingUser
  recommendedAt: Date
}

export type RecommendingUser = {
  userId: string
  name: string
  username: string
  profileImageURL?: string
}

export type PageInfo = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string
  endCursor: string
  totalCount: number
}

export type SetLinkArchivedInput = {
  linkId: string
  archived: boolean
}

type SetLinkArchivedSuccess = {
  linkId: string
  message?: string
}

export type SetLinkArchivedData = {
  setLinkArchived: SetLinkArchivedSuccess
  errorCodes?: string[]
}

export type DeleteItemInput = {
  articleID: string
  bookmark: boolean
}

export type SetBookmarkArticle = {
  errorCodes?: string[]
}

export type SetBookmarkArticleData = {
  setBookmarkArticle: SetBookmarkArticle
}

export type UpdateLibraryItemInput = {
  pageId: string
  title?: string
  byline?: string | undefined
  description?: string
  savedAt?: string
  publishedAt?: string
  state?: State
}

export type UpdateLibraryItem = {
  errorCodes?: string[]
}

export type UpdateLibraryItemData = {
  updatePage: UpdateLibraryItem
}
