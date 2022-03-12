import { gql } from 'graphql-request'
import useSWRInfinite from 'swr/infinite'
import { gqlFetcher } from '../networkHelpers'
import type { ArticleFragmentData } from '../fragments/articleFragment'
import { articleFragment } from '../fragments/articleFragment'
import { setLinkArchivedMutation } from '../mutations/setLinkArchivedMutation'
import { deleteLinkMutation } from '../mutations/deleteLinkMutation'
import { articleReadingProgressMutation } from '../mutations/articleReadingProgressMutation'
import { labelFragment } from '../fragments/labelFragment'
import { Label } from './useGetLabelsQuery'
import { KeyedMutator, Cache } from 'swr'
import { ScopedMutator } from 'swr/dist/types'

export type LibraryItemsQueryInput = {
  limit: number
  sortDescending: boolean
  searchQuery?: string
  cursor?: string
}

type LibraryItemsQueryResponse = {
  articlesPages?: LibraryItemsData[]
  articlesDataError?: unknown
  isLoading: boolean
  isValidating: boolean
  size: number
  setSize: (
    size: number | ((_size: number) => number)
  ) => Promise<unknown[] | undefined>
  performActionOnItem: (action: LibraryItemAction, item: LibraryItem) => void
}

type LibraryItemAction =
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'mark-read'
  | 'mark-unread'

export type LibraryItemsData = {
  articles: LibraryItems
}

type LibraryItems = {
  edges: LibraryItem[]
  pageInfo: PageInfo
  errorCodes?: string[]
}

export type LibraryItem = {
  cursor: string
  node: LibraryItemNode
}

export type LibraryItemNode = ArticleFragmentData & {
  description?: string
  hasContent: boolean
  originalArticleUrl: string
  sharedComment?: string
  labels?: Label[]
}

export type PageInfo = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string
  endCursor: string
  totalCount: number
}

export function useGetLibraryItemsQuery({
  limit,
  sortDescending,
  searchQuery,
  cursor,
}: LibraryItemsQueryInput): LibraryItemsQueryResponse {
  const query = gql`
    query GetArticles(
      $sharedOnly: Boolean
      $sort: SortParams
      $after: String
      $first: Int
      $query: String
    ) {
      articles(
        sharedOnly: $sharedOnly
        sort: $sort
        first: $first
        after: $after
        query: $query
      ) {
        ... on ArticlesSuccess {
          edges {
            cursor
            node {
              ...ArticleFields
              labels {
                ...LabelFields
              }
              originalArticleUrl
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
        ... on ArticlesError {
          errorCodes
        }
      }
    }
    ${articleFragment}
    ${labelFragment}
  `

  const variables = {
    sharedOnly: false,
    sort: {
      order: sortDescending ? 'DESCENDING' : 'ASCENDING',
      by: 'UPDATED_TIME',
    },
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
        pageIndex === 0
          ? undefined
          : previousResult.articles.pageInfo.endCursor,
      ]
    },
    (_query, _l, _s, _sq, cursor: string) => {
      return gqlFetcher(query, { ...variables, after: cursor }, true)
    }
  )

  let responseError = error
  let responsePages = data as LibraryItemsData[] | undefined

  // We need to check the response errors here and return the error
  // it will be nested in the data pages, if there is one error,
  // we invalidate the data and return the error. We also zero out
  // the response in the case of an error.
  if (!error && responsePages) {
    const errors = responsePages.filter((d) => d.articles.errorCodes && d.articles.errorCodes.length > 0)
    if (errors?.length > 0) {
      responseError = errors
      responsePages = undefined
    }
  }

  return {
    isValidating,
    articlesPages: responsePages || undefined,
    articlesDataError: responseError,
    isLoading: !error && !data,
    performActionOnItem: async (action: LibraryItemAction, item: LibraryItem) => {
      performActionOnItem(query, responsePages, action, item, mutate)
    },
    size,
    setSize,
  }
}

export const removeItemFromCache = (
  cache: Cache<unknown>,
  mutate: ScopedMutator,
  itemId: string,
) => {
  try {
    // First update the individaul article pages
    const mappedCache = cache as Map<string, unknown>
    mappedCache.forEach((value: any, key) => {
      if (typeof value == 'object' && 'articles' in value) {
        const articles = value.articles as LibraryItems
        const idx = articles.edges.findIndex((edge) => edge.node.id == itemId)
        if (idx > -1) {
          const newEdges = articles.edges.splice(idx, 1)
          value.articles.edges = newEdges
          mutate(key, value, false)
        }
      }
    })
    // Update the infinite scroll list of pages
    mappedCache.forEach((value: any, key) => {
      if (Array.isArray(value)) {
        const idx = value.findIndex((item) => 'articles' in item)
        if (idx > -1) {
          mutate(key, value, false)
        }
      }
    })
  } catch (error) {
    console.log('error removing item from cache', error)
  }
}

const performActionOnItem = async (
  query: string,
  responsePages: LibraryItemsData[] | undefined,
  action: LibraryItemAction,
  item: LibraryItem,
  mutate:  KeyedMutator<unknown[]>
) => {
  if (!responsePages) {
    return
  }

  const updateData = (mutatedItem: LibraryItem | undefined) => {
    if (!responsePages) {
      return
    }
    for (const articlesData of responsePages) {
      const itemIndex = articlesData.articles.edges.indexOf(item)
      if (itemIndex !== -1) {
        if (typeof mutatedItem === 'undefined') {
          articlesData.articles.edges.splice(itemIndex, 1)
        } else {
          articlesData.articles.edges[itemIndex] = mutatedItem
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
      })
      break
    case 'delete':
      updateData(undefined)
      deleteLinkMutation(item.node.id)
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
  }
}
