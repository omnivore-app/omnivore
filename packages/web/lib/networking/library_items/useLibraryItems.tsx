import { gql, GraphQLClient } from 'graphql-request'
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ContentReader, PageType, State } from '../fragments/articleFragment'
import { Highlight, highlightFragment } from '../fragments/highlightFragment'
import { makeGqlFetcher, requestHeaders } from '../networkHelpers'
import { Label } from '../fragments/labelFragment'
import {
  GQL_DELETE_LIBRARY_ITEM,
  GQL_GET_LIBRARY_ITEM_CONTENT,
  GQL_MOVE_ITEM_TO_FOLDER,
  GQL_SAVE_ARTICLE_READING_PROGRESS,
  GQL_SEARCH_QUERY,
  GQL_SET_LABELS,
  GQL_SET_LINK_ARCHIVED,
  GQL_UPDATE_LIBRARY_ITEM,
} from './gql'
import { gqlEndpoint } from '../../appConfig'

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
  updateItemPropertyInCache(queryClient, itemId, 'state', newState)
}

function createDictionary(
  propertyName: string,
  value: any
): { [key: string]: any } {
  return {
    [propertyName]: value,
  }
}
const updateItemPropertyInCache = (
  queryClient: QueryClient,
  itemId: string,
  propertyName: string,
  propertyValue: any
) => {
  updateItemProperty(queryClient, itemId, (oldItem) => {
    const setter = createDictionary(propertyName, propertyValue)
    return {
      ...oldItem,
      ...setter,
    }
  })
}

export const updateItemProperty = (
  queryClient: QueryClient,
  itemId: string,
  updateFunc: (input: ArticleAttributes) => ArticleAttributes
) => {
  let foundItemSlug: string | undefined
  const keys = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['libraryItems'] })
  keys.forEach((query) => {
    queryClient.setQueryData(query.queryKey, (data: any) => {
      if (!data) return data
      const updatedData = {
        ...data,
        pages: data.pages.map((page: any) => ({
          ...page,
          edges: page.edges.map((edge: any) => {
            if (edge.node.id === itemId) {
              foundItemSlug = edge.node.slug
              return {
                ...edge,
                node: { ...edge.node, ...updateFunc(edge.node) },
              }
            }
            return edge
          }),
        })),
      }
      return updatedData
    })
    if (foundItemSlug)
      queryClient.setQueryData(
        ['libraryItem', foundItemSlug],
        (oldData: ArticleAttributes) => {
          return {
            ...oldData,
            ...updateFunc(oldData),
          }
        }
      )
  })
}

const updateItemPropertiesInCache = (
  queryClient: QueryClient,
  itemId: string,
  item: ArticleAttributes
) => {
  const keys = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['libraryItems'] })
  keys.forEach((query) => {
    queryClient.setQueryData(query.queryKey, (data: any) => {
      if (!data) return data
      return {
        ...data,
        pages: data.pages.map((page: any) => ({
          ...page,
          edges: page.edges.map((edge: any) =>
            edge.node.id === itemId
              ? { ...edge, node: { ...edge.node, ...item } }
              : edge
          ),
        })),
      }
    })
  })
}

export function useGetLibraryItems(
  folder: string | undefined,
  { limit, searchQuery }: LibraryItemsQueryInput,
  enabled = true
) {
  const fullQuery = folder
    ? (`in:${folder} use:folders ` + (searchQuery ?? '')).trim()
    : searchQuery ?? ''

  return useInfiniteQuery({
    queryKey: ['libraryItems', fullQuery],
    queryFn: async ({ pageParam }) => {
      const response = (await gqlFetcher(GQL_SEARCH_QUERY, {
        after: pageParam,
        first: limit,
        query: fullQuery,
        includeContent: false,
      })) as LibraryItemsData
      return response.search
    },
    enabled,
    initialPageParam: '0',
    getNextPageParam: (lastPage: LibraryItems) => {
      return lastPage.pageInfo.hasNextPage
        ? lastPage?.pageInfo?.endCursor
        : undefined
    },
  })
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
  return useMutation({
    mutationFn: archiveItem,
    onMutate: async (input: SetLinkArchivedInput) => {
      await queryClient.cancelQueries({ queryKey: ['libraryItems'] })

      updateItemStateInCache(
        queryClient,
        input.linkId,
        input.archived ? State.ARCHIVED : State.SUCCEEDED
      )

      return { previousItems: queryClient.getQueryData(['libraryItems']) }
    },
    onError: (error, itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['libraryItems'], context.previousItems)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['libraryItems'],
      })
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
  return useMutation({
    mutationFn: deleteItem,
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['libraryItems'],
      })
      updateItemStateInCache(queryClient, itemId, State.DELETED)
      return { previousItems: queryClient.getQueryData(['libraryItems']) }
    },
    onError: (error, itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['libraryItems'], context.previousItems)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['libraryItems'],
      })
    },
  })
}

export const useRestoreItem = () => {
  const queryClient = useQueryClient()
  const restoreItem = async (itemId: string) => {
    const result = (await gqlFetcher(GQL_UPDATE_LIBRARY_ITEM, {
      input: { pageId: itemId, state: State.SUCCEEDED },
    })) as UpdateLibraryItemData
    if (result.updatePage.errorCodes?.length) {
      throw new Error(result.updatePage.errorCodes[0])
    }
    return result.updatePage
  }
  return useMutation({
    mutationFn: restoreItem,
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: ['libraryItems'] })
      updateItemStateInCache(queryClient, itemId, State.SUCCEEDED)
      return { previousItems: queryClient.getQueryData(['libraryItems']) }
    },
    onError: (error, itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['libraryItems'], context.previousItems)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['libraryItems'],
      })
    },
  })
}

export const useUpdateItemReadStatus = () => {
  const queryClient = useQueryClient()
  const updateItemReadStatus = async (
    input: ArticleReadingProgressMutationInput
  ) => {
    const result = (await gqlFetcher(GQL_SAVE_ARTICLE_READING_PROGRESS, {
      input,
    })) as ArticleReadingProgressMutationData
    if (result.saveArticleReadingProgress.errorCodes?.length) {
      throw new Error(result.saveArticleReadingProgress.errorCodes[0])
    }
    return result.saveArticleReadingProgress.updatedArticle
  }
  return useMutation({
    mutationFn: updateItemReadStatus,
    onMutate: async (input: ArticleReadingProgressMutationInput) => {
      await queryClient.cancelQueries({ queryKey: ['libraryItems'] })
      updateItemPropertyInCache(
        queryClient,
        input.id,
        'readingProgressPercent',
        input.readingProgressPercent
      )
      return { previousItems: queryClient.getQueryData(['libraryItems']) }
    },
    onError: (error, input, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['libraryItems'], context.previousItems)
      }
    },
    onSuccess: (data, variables, context) => {
      if (data) {
        updateItemPropertyInCache(
          queryClient,
          data.id,
          'readingProgressPercent',
          data.readingProgressPercent
        )
      }
    },
  })
}

export const useGetLibraryItemContent = (username: string, slug: string) => {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ['libraryItem', slug],
    queryFn: async () => {
      const response = (await gqlFetcher(GQL_GET_LIBRARY_ITEM_CONTENT, {
        slug,
        username,
        includeFriendsHighlights: false,
      })) as ArticleData
      if (response.article.errorCodes?.length) {
        throw new Error(response.article.errorCodes[0])
      }
      const article = response.article.article
      if (article) {
        updateItemPropertiesInCache(queryClient, article.id, article)
      }
      return response.article.article
    },
  })
}

export const useMoveItemToFolder = () => {
  const queryClient = useQueryClient()
  const moveItem = async (variables: { itemId: string; folder: string }) => {
    const result = (await gqlFetcher(GQL_MOVE_ITEM_TO_FOLDER, {
      id: variables.itemId,
      folder: variables.folder,
    })) as MoveToFolderData
    if (result.moveToFolder.errorCodes?.length) {
      throw new Error(result.moveToFolder.errorCodes[0])
    }
    return result.moveToFolder
  }
  return useMutation({
    mutationFn: moveItem,
    onMutate: async (variables: { itemId: string; folder: string }) => {
      await queryClient.cancelQueries({ queryKey: ['libraryItems'] })
      updateItemPropertyInCache(
        queryClient,
        variables.itemId,
        'folder',
        variables.folder
      )
      return { previousItems: queryClient.getQueryData(['libraryItems']) }
    },
    onError: (error, itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['libraryItems'], context.previousItems)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['libraryItems'],
      })
    },
  })
}

export const useSetItemLabels = () => {
  const queryClient = useQueryClient()
  const setLabels = async (variables: { itemId: string; labels: Label[] }) => {
    const labelIds = variables.labels.map((l) => l.id)
    const result = (await gqlFetcher(GQL_SET_LABELS, {
      input: { pageId: variables.itemId, labelIds },
    })) as SetLabelsData
    if (result.setLabels.errorCodes?.length) {
      throw new Error(result.setLabels.errorCodes[0])
    }
    return result.setLabels.labels
  }
  return useMutation({
    mutationFn: setLabels,
    onMutate: async (variables: { itemId: string; labels: Label[] }) => {
      await queryClient.cancelQueries({ queryKey: ['libraryItems'] })
      updateItemPropertyInCache(
        queryClient,
        variables.itemId,
        'labels',
        variables.labels
      )
      return { previousItems: queryClient.getQueryData(['libraryItems']) }
    },
    onError: (error, itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['libraryItems'], context.previousItems)
      }
    },
    onSuccess: (newLabels, variables) => {
      updateItemPropertyInCache(
        queryClient,
        variables.itemId,
        'labels',
        newLabels
      )
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['libraryItems'],
      })
    },
  })
}

type SetLabelsData = {
  setLabels: SetLabelsResult
}

type SetLabelsResult = {
  labels?: Label[]
  errorCodes?: string[]
}

export type TextDirection = 'RTL' | 'LTR'

export type ArticleAttributes = {
  id: string
  title: string
  url: string
  originalArticleUrl: string
  author?: string
  image?: string
  savedAt: string
  createdAt: string
  publishedAt?: string
  description?: string
  wordsCount?: number
  originalHtml?: string
  contentReader: ContentReader
  readingProgressPercent: number
  readingProgressTopPercent?: number
  readingProgressAnchorIndex: number
  slug: string
  folder: string
  savedByViewer?: boolean
  content: string
  highlights: Highlight[]
  linkId: string
  labels?: Label[]
  state?: State
  directionality?: TextDirection
  recommendations?: Recommendation[]
}

type MoveToFolderData = {
  moveToFolder: MoveToFolderResult
}

type MoveToFolderResult = {
  success?: boolean
  errorCodes?: string[]
}

type ArticleResult = {
  article?: ArticleAttributes
  errorCodes?: string[]
}
type ArticleData = {
  article: ArticleResult
}

type ArticleReadingProgressUpdatedArticle = {
  id: string
  readingProgressPercent: number
  readingProgressAnchorIndex: string
}

type ArticleReadingProgressResult = {
  errorCodes?: string[]
  updatedArticle?: ArticleReadingProgressUpdatedArticle
}

type ArticleReadingProgressMutationData = {
  saveArticleReadingProgress: ArticleReadingProgressResult
}

export type ArticleReadingProgressMutationInput = {
  id: string
  force?: boolean
  readingProgressPercent?: number
  readingProgressTopPercent?: number
  readingProgressAnchorIndex?: number
}

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

type LibraryItemsData = {
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

type SetLinkArchivedInput = {
  linkId: string
  archived: boolean
}

type SetLinkArchivedSuccess = {
  linkId: string
  message?: string
}

type SetLinkArchivedData = {
  setLinkArchived: SetLinkArchivedSuccess
  errorCodes?: string[]
}

type SetBookmarkArticle = {
  errorCodes?: string[]
}

type SetBookmarkArticleData = {
  setBookmarkArticle: SetBookmarkArticle
}

type UpdateLibraryItem = {
  errorCodes?: string[]
}

type UpdateLibraryItemData = {
  updatePage: UpdateLibraryItem
}
