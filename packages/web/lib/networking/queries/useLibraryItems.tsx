import { gql, GraphQLClient } from 'graphql-request'
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from 'react-query'
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
import { makeGqlFetcher, requestHeaders } from '../networkHelpers'
import { Label } from '../fragments/labelFragment'
import { moveToFolderMutation } from '../mutations/moveToLibraryMutation'
import {
  LibraryItemNode,
  LibraryItems,
  LibraryItemsData,
  LibraryItemsQueryInput,
  SetBookmarkArticleData,
  SetLinkArchivedData,
  SetLinkArchivedInput,
  UpdateLibraryItemData,
} from './types'
import {
  GQL_DELETE_LIBRARY_ITEM,
  GQL_SEARCH_QUERY,
  GQL_SET_LINK_ARCHIVED,
  GQL_UPDATE_LIBRARY_ITEM,
} from './gql-queries'
import { parseGraphQLResponse } from './gql-errors'
import { gqlEndpoint } from '../../appConfig'
import { GraphQLResponse } from 'graphql-request/dist/types'

function gqlFetcher(
  query: string,
  variables?: unknown,
  requiresAuth = true
): Promise<unknown> {
  // if (requiresAuth) {
  //   verifyAuth()
  // }

  const graphQLClient = new GraphQLClient(gqlEndpoint, {
    credentials: 'include',
    mode: 'cors',
  })

  return graphQLClient.request(query, variables, requestHeaders())
}

const updateItemStateInCache = (
  queryClient: QueryClient,
  itemId: string,
  newState: State
) => {
  const keys = queryClient.getQueryCache().findAll('libraryItems')
  keys.forEach((query) => {
    queryClient.setQueryData(query.queryKey, (data: any) => {
      if (!data) return data
      return {
        ...data,
        pages: data.pages.map((page: any) => ({
          ...page,
          edges: page.edges.map((edge: any) =>
            edge.node.id === itemId
              ? { ...edge, node: { ...edge.node, state: newState } }
              : edge
          ),
        })),
      }
    })
  })
}

export function useGetLibraryItems(
  folder: string | undefined,
  { limit, searchQuery }: LibraryItemsQueryInput
) {
  const fullQuery = folder
    ? (`in:${folder} use:folders ` + (searchQuery ?? '')).trim()
    : searchQuery ?? ''

  return useInfiniteQuery(
    ['libraryItems', fullQuery],
    async ({ pageParam }) => {
      const response = (await gqlFetcher(GQL_SEARCH_QUERY, {
        after: pageParam,
        first: limit,
        query: fullQuery,
        includeContent: false,
      })) as LibraryItemsData
      return response.search
    },
    {
      getNextPageParam: (lastPage: LibraryItems) => {
        return lastPage.pageInfo.hasNextPage
          ? lastPage?.pageInfo?.endCursor
          : undefined
      },
    }
  )
}

export const useArchiveItem = () => {
  const queryClient = useQueryClient()
  const archiveItem = async (input: SetLinkArchivedInput) => {
    const result = (await gqlFetcher(GQL_SET_LINK_ARCHIVED, {
      input,
    })) as SetLinkArchivedData
    if (result.errorCodes?.length) {
      throw new Error(result.errorCodes[0])
    }
    return result.setLinkArchived
  }
  return useMutation(archiveItem, {
    onMutate: async (input: SetLinkArchivedInput) => {
      await queryClient.cancelQueries('libraryItems')

      updateItemStateInCache(
        queryClient,
        input.linkId,
        input.archived ? State.ARCHIVED : State.SUCCEEDED
      )

      return { previousItems: queryClient.getQueryData('libraryItems') }
    },
    onError: (error, itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData('libraryItems', context.previousItems)
      }
    },
    onSettled: () => {
      console.log('settled')
      queryClient.invalidateQueries('libraryItems')
    },
  })
}

export const useDeleteItem = () => {
  const queryClient = useQueryClient()
  const deleteItem = async (itemId: string) => {
    const result = (await gqlFetcher(GQL_DELETE_LIBRARY_ITEM, {
      input: { articleID: itemId, bookmark: false },
    })) as SetBookmarkArticleData
    if (result.setBookmarkArticle.errorCodes?.length) {
      throw new Error(result.setBookmarkArticle.errorCodes[0])
    }
    return result.setBookmarkArticle
  }
  return useMutation(deleteItem, {
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries('libraryItems')
      updateItemStateInCache(queryClient, itemId, State.DELETED)
      return { previousItems: queryClient.getQueryData('libraryItems') }
    },
    onError: (error, itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData('libraryItems', context.previousItems)
      }
    },
    onSettled: () => {
      console.log('settled')
      queryClient.invalidateQueries('libraryItems')
    },
  })
}

export const useRestoreItem = () => {
  const queryClient = useQueryClient()
  const restoreItem = async (itemId: string) => {
    const result = (await gqlFetcher(GQL_UPDATE_LIBRARY_ITEM, {
      input: { pageId: itemId, state: State.SUCCEEDED },
    })) as UpdateLibraryItemData
    console.log('result: ', result)
    if (result.updatePage.errorCodes?.length) {
      throw new Error(result.updatePage.errorCodes[0])
    }
    return result.updateLibraryItem
  }
  return useMutation(restoreItem, {
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries('libraryItems')
      updateItemStateInCache(queryClient, itemId, State.SUCCEEDED)
      return { previousItems: queryClient.getQueryData('libraryItems') }
    },
    onError: (error, itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData('libraryItems', context.previousItems)
      }
    },
    onSettled: () => {
      console.log('settled')
      queryClient.invalidateQueries('libraryItems')
    },
  })
}

// export const useRestoreItem = () => {
//   const queryClient = useQueryClient()
//   return useMutation(restoreItem, {
//     onMutate: async (itemId) => {
//       await queryClient.cancelQueries('libraryItems')
//       const previousItems = queryClient.getQueryData<any>('libraryItems')

//       updateItemStateInCache(queryClient, itemId, 'ACTIVE')

//       return { previousItems }
//     },
//     onError: (error, itemId, context) => {
//       if (context?.previousItems) {
//         queryClient.setQueryData('libraryItems', context.previousItems)
//       }
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries('libraryItems')
//     },
//   })
// }

export function useGetRawSearchItemsQuery(
  {
    limit,
    searchQuery,
    cursor,
    includeContent = false,
  }: LibraryItemsQueryInput,
  shouldFetch = true
) {
  // const query = gql`
  //   query Search(
  //     $after: String
  //     $first: Int
  //     $query: String
  //     $includeContent: Boolean
  //   ) {
  //     search(
  //       first: $first
  //       after: $after
  //       query: $query
  //       includeContent: $includeContent
  //     ) {
  //       ... on SearchSuccess {
  //         edges {
  //           cursor
  //           node {
  //             id
  //             title
  //             slug
  //             url
  //             folder
  //             createdAt
  //             author
  //             image
  //             description
  //             publishedAt
  //             originalArticleUrl
  //             siteName
  //             siteIcon
  //             subscription
  //             readAt
  //             savedAt
  //             wordsCount
  //           }
  //         }
  //         pageInfo {
  //           hasNextPage
  //           hasPreviousPage
  //           startCursor
  //           endCursor
  //           totalCount
  //         }
  //       }
  //       ... on SearchError {
  //         errorCodes
  //       }
  //     }
  //   }
  // `

  // const { data, error, isFetching, refetch } = useQuery(
  //   ['rawSearchItems', searchQuery, cursor],
  //   () =>
  //     makeGqlFetcher(query, {
  //       after: cursor,
  //       first: limit,
  //       query: searchQuery,
  //       includeContent,
  //     }),
  //   {
  //     enabled: shouldFetch,
  //     refetchOnWindowFocus: false,
  //   }
  // )

  // const responseData = data as LibraryItemsData | undefined

  // if (responseData?.errorCodes) {
  return {
    isFetching: false,
    items: [],
    isLoading: false,
    error: true,
  }
  // }

  // return {
  //   isFetching,
  //   items: responseData?.search.edges.map((edge) => edge.node) ?? [],
  //   itemsDataError: error,
  //   isLoading: !error && !data,
  //   error: !!error,
  // }
}
