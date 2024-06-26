import { gql } from 'graphql-request'
import useSWRInfinite from 'swr/infinite'
import {
  showErrorToast,
  showSuccessToast,
  showSuccessToastWithUndo,
} from '../../toastHelpers'
import { ContentReader, PageType, State } from '../fragments/articleFragment'
import { Highlight, highlightFragment } from '../fragments/highlightFragment'
import { articleReadingProgressMutation } from '../mutations/articleReadingProgressMutation'
import { deleteLinkMutation } from '../mutations/deleteLinkMutation'
import { setLinkArchivedMutation } from '../mutations/setLinkArchivedMutation'
import { updatePageMutation } from '../mutations/updatePageMutation'
import { gqlFetcher } from '../networkHelpers'
import { Label } from './../fragments/labelFragment'
import { moveToFolderMutation } from '../mutations/moveToLibraryMutation'

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

type LibraryItemsQueryResponse = {
  itemsPages?: LibraryItemsData[]
  itemsDataError?: unknown
  isLoading: boolean
  isValidating: boolean
  error: boolean
  size: number
  setSize: (
    size: number | ((_size: number) => number)
  ) => Promise<unknown[] | undefined>
  performActionOnItem: (action: LibraryItemAction, item: LibraryItem) => void
  mutate: () => void
}

type LibraryItemAction =
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'mark-read'
  | 'mark-unread'
  | 'refresh'
  | 'unsubscribe'
  | 'update-item'
  | 'move-to-inbox'

export type LibraryItemsData = {
  search: LibraryItems
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

export const recommendationFragment = gql`
  fragment RecommendationFields on Recommendation {
    id
    name
    note
    user {
      userId
      name
      username
      profileImageURL
    }
    recommendedAt
  }
`

export function useGetLibraryItemsQuery(
  folder: string,
  { limit, searchQuery, cursor, includeContent = false }: LibraryItemsQueryInput
): LibraryItemsQueryResponse {
  const fullQuery = (`in:${folder} use:folders ` + (searchQuery ?? '')).trim()
  const query = gql`
    query Search(
      $after: String
      $first: Int
      $query: String
      $includeContent: Boolean
    ) {
      search(
        first: $first
        after: $after
        query: $query
        includeContent: $includeContent
      ) {
        ... on SearchSuccess {
          edges {
            cursor
            node {
              id
              title
              slug
              url
              folder
              pageType
              contentReader
              createdAt
              isArchived
              readingProgressPercent
              readingProgressTopPercent
              readingProgressAnchorIndex
              author
              image
              description
              publishedAt
              ownedByViewer
              originalArticleUrl
              uploadFileId
              labels {
                id
                name
                color
              }
              pageId
              shortId
              quote
              annotation
              state
              siteName
              siteIcon
              subscription
              readAt
              savedAt
              wordsCount
              recommendations {
                id
                name
                note
                user {
                  userId
                  name
                  username
                  profileImageURL
                }
                recommendedAt
              }
              highlights {
                ...HighlightFields
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
            totalCount
          }
        }
        ... on SearchError {
          errorCodes
        }
      }
    }
    ${highlightFragment}
  `

  const variables = {
    after: cursor,
    first: limit,
    query: fullQuery,
    includeContent,
  }

  const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      const key = [query, variables.first, variables.query, undefined]
      const previousResult = previousPageData as LibraryItemsData
      if (pageIndex === 0) {
        return key
      }
      return [
        query,
        limit,
        searchQuery,
        pageIndex === 0 ? undefined : previousResult.search.pageInfo.endCursor,
      ]
    },
    (args: any[]) => {
      const pageIndex = args[3] as number
      return gqlFetcher(query, { ...variables, after: pageIndex }, true)
    },
    { revalidateFirstPage: false }
  )

  let responseError = error
  let responsePages = data as LibraryItemsData[] | undefined

  // We need to check the response errors here and return the error
  // it will be nested in the data pages, if there is one error,
  // we invalidate the data and return the error. We also zero out
  // the response in the case of an error.
  if (!error && responsePages) {
    const errors = responsePages.filter(
      (d) => d.search.errorCodes && d.search.errorCodes.length > 0
    )
    if (errors?.length > 0) {
      responseError = errors
      responsePages = undefined
    }
  }

  const getIndexOf = (page: LibraryItems, item: LibraryItem) => {
    return page.edges.findIndex((i) => i.node.id === item.node.id)
  }

  const performActionOnItem = async (
    action: LibraryItemAction,
    item: LibraryItem
  ) => {
    console.log('performing action on items: ', action)
    if (!responsePages) {
      return
    }

    const updateData = (mutatedItem: LibraryItem | undefined) => {
      if (!responsePages) {
        return
      }

      for (const searchResults of responsePages) {
        const itemIndex = getIndexOf(searchResults.search, item)
        if (itemIndex !== -1) {
          if (typeof mutatedItem === 'undefined') {
            searchResults.search.edges.splice(itemIndex, 1)
          } else {
            searchResults.search.edges.splice(itemIndex, 1, mutatedItem)
          }
          break
        }
      }
      mutate(responsePages, false)
    }

    switch (action) {
      case 'move-to-inbox':
        updateData({
          cursor: item.cursor,
          node: {
            ...item.node,
            folder: 'inbox',
          },
        })

        moveToFolderMutation(item.cursor, 'inbox').then((res) => {
          if (res) {
            showSuccessToast('Link moved', { position: 'bottom-right' })
          } else {
            showErrorToast('Error moving link', { position: 'bottom-right' })
          }
        })

        mutate()
        break
      case 'archive':
        updateData({
          cursor: item.cursor,
          node: {
            ...item.node,
            isArchived: true,
          },
        })

        setLinkArchivedMutation({
          linkId: item.node.id,
          archived: true,
        }).then((res) => {
          if (res) {
            showSuccessToast('Link archived', { position: 'bottom-right' })
          } else {
            showErrorToast('Error archiving link', { position: 'bottom-right' })
          }
        })

        mutate()

        break
      case 'unarchive':
        updateData({
          cursor: item.cursor,
          node: {
            ...item.node,
            isArchived: false,
          },
        })

        setLinkArchivedMutation({
          linkId: item.node.id,
          archived: false,
        }).then((res) => {
          if (res) {
            showSuccessToast('Link unarchived', { position: 'bottom-right' })
          } else {
            showErrorToast('Error unarchiving link', {
              position: 'bottom-right',
            })
          }
        })
        mutate()
        break
      case 'delete':
        updateData({
          cursor: item.cursor,
          node: {
            ...item.node,
            state: State.DELETED,
          },
        })

        const pageId = item.node.id
        deleteLinkMutation(pageId).then((res) => {
          if (res) {
            showSuccessToastWithUndo('Page deleted', async () => {
              const result = await updatePageMutation({
                pageId: pageId,
                state: State.SUCCEEDED,
              })

              mutate()

              if (result) {
                showSuccessToast('Page recovered')
              } else {
                showErrorToast(
                  'Error recovering page, check your deleted items'
                )
              }
            })
          } else {
            showErrorToast('Error removing link', { position: 'bottom-right' })
          }
        })
        break
      case 'mark-read':
        updateData({
          cursor: item.cursor,
          node: {
            ...item.node,
            readingProgressPercent: 100,
            readingProgressTopPercent: 100,
          },
        })
        articleReadingProgressMutation({
          id: item.node.id,
          force: true,
          readingProgressPercent: 100,
          readingProgressTopPercent: 100,
          readingProgressAnchorIndex: 0,
        })
        mutate()
        break
      case 'mark-unread':
        updateData({
          cursor: item.cursor,
          node: {
            ...item.node,
            readingProgressPercent: 0,
            readingProgressTopPercent: 0,
            readingProgressAnchorIndex: 0,
          },
        })
        articleReadingProgressMutation({
          id: item.node.id,
          force: true,
          readingProgressPercent: 0,
          readingProgressTopPercent: 0,
          readingProgressAnchorIndex: 0,
        })
        mutate()
        break
      case 'update-item':
        updateData(item)
        mutate()
        break
      case 'refresh':
        await mutate()
    }
  }

  return {
    isValidating,
    itemsPages: responsePages || undefined,
    itemsDataError: responseError,
    isLoading: !error && !data,
    performActionOnItem,
    size,
    setSize,
    mutate,
    error: !!error,
  }
}
