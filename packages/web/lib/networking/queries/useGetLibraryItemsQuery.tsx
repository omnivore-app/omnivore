import { gql } from 'graphql-request'
import useSWRInfinite from 'swr/infinite'
import { gqlFetcher } from '../networkHelpers'
import type { PageType, State } from '../fragments/articleFragment'
import { ContentReader } from '../fragments/articleFragment'
import { setLinkArchivedMutation } from '../mutations/setLinkArchivedMutation'
import { deleteLinkMutation } from '../mutations/deleteLinkMutation'
import { unsubscribeMutation } from '../mutations/unsubscribeMutation'
import { articleReadingProgressMutation } from '../mutations/articleReadingProgressMutation'
import { Label } from './../fragments/labelFragment'
import { showErrorToast, showSuccessToast } from '../../toastHelpers'

export type LibraryItemsQueryInput = {
  limit: number
  sortDescending: boolean
  searchQuery?: string
  cursor?: string
}

type LibraryItemsQueryResponse = {
  itemsPages?: LibraryItemsData[]
  itemsDataError?: unknown
  isLoading: boolean
  isValidating: boolean
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
  readingProgressAnchorIndex: number
  slug: string
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
  subscription?: string
  readAt?: string
  savedAt?: string
  recommendations?: Recommendation[]
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

export function useGetLibraryItemsQuery({
  limit,
  sortDescending,
  searchQuery,
  cursor,
}: LibraryItemsQueryInput): LibraryItemsQueryResponse {
  const query = gql`
    query Search($after: String, $first: Int, $query: String) {
      search(first: $first, after: $after, query: $query) {
        ... on SearchSuccess {
          edges {
            cursor
            node {
              id
              title
              slug
              url
              pageType
              contentReader
              createdAt
              isArchived
              readingProgressPercent
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
              subscription
              readAt
              savedAt
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
  `

  const variables = {
    after: cursor,
    first: limit,
    query: searchQuery,
  }

  const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      const key = [query, limit, sortDescending, searchQuery, undefined]
      const previousResult = previousPageData as LibraryItemsData

      if (pageIndex === 0) {
        return key
      }
      return [
        query,
        limit,
        sortDescending,
        searchQuery,
        pageIndex === 0 ? undefined : previousResult.search.pageInfo.endCursor,
      ]
    },
    (_query, _l, _s, _sq, cursor) => {
      return gqlFetcher(query, { ...variables, after: cursor }, true)
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
      case 'archive':
        if (/in:all/.test(query)) {
          updateData({
            cursor: item.cursor,
            node: {
              ...item.node,
              isArchived: true,
            },
          })
        } else {
          updateData(undefined)
        }

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

        break
      case 'unarchive':
        if (/in:all/.test(query)) {
          updateData({
            cursor: item.cursor,
            node: {
              ...item.node,
              isArchived: false,
            },
          })
        } else {
          updateData(undefined)
        }

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
        break
      case 'delete':
        updateData(undefined)
        deleteLinkMutation(item.node.id).then((res) => {
          if (res) {
            showSuccessToast('Link removed', { position: 'bottom-right' })
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
          },
        })
        articleReadingProgressMutation({
          id: item.node.id,
          readingProgressPercent: 100,
          readingProgressAnchorIndex: 0,
        })
        break
      case 'mark-unread':
        updateData({
          cursor: item.cursor,
          node: {
            ...item.node,
            readingProgressPercent: 0,
          },
        })
        articleReadingProgressMutation({
          id: item.node.id,
          readingProgressPercent: 0,
          readingProgressAnchorIndex: 0,
        })
        break
      case 'unsubscribe':
        if (!!item.node.subscription) {
          updateData({
            cursor: item.cursor,
            node: {
              ...item.node,
              subscription: undefined,
            },
          })
          unsubscribeMutation(item.node.subscription).then((res) => {
            if (res) {
              showSuccessToast('Unsubscribed successfully', {
                position: 'bottom-right',
              })
            } else {
              showErrorToast('Error unsubscribing', {
                position: 'bottom-right',
              })
            }
          })
        }
      case 'update-item':
        updateData(item)
        break
      case 'refresh':
        await mutate()
    }
  }

  console.log('responsePages', responsePages)

  return {
    isValidating,
    itemsPages: responsePages || undefined,
    itemsDataError: responseError,
    isLoading: !error && !data,
    performActionOnItem,
    size,
    setSize,
    mutate,
  }
}
