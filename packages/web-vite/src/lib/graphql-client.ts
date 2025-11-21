// Minimal GraphQL helper targeting the NestJS `/api/graphql` endpoint
// Mirrors the behaviour of the legacy web package's fetcher but keeps dependencies light

import { useCallback, useState } from 'react'

import type { DeleteResult, HighlightColor, LibraryItem } from '../types/api'
import {
  HIGHLIGHT_FRAGMENT,
  LABEL_BASIC_FRAGMENT,
  LABEL_FRAGMENT,
  LIBRARY_ITEM_FULL_FRAGMENT,
  READING_PROGRESS_FRAGMENT,
} from './graphql-fragments'

const DEFAULT_GRAPHQL_PATH = '/api/graphql'
const TOKEN_STORAGE_KEY = 'omnivore-auth-token'

const resolveGraphqlUrl = (): string => {
  const rawBase = import.meta.env.VITE_API_URL as string | undefined
  const normalizedBase =
    rawBase && rawBase.trim().length > 0
      ? rawBase.trim().replace(/\/$/, '')
      : ''

  if (!normalizedBase) {
    return DEFAULT_GRAPHQL_PATH
  }

  // Handle env values that point at `/api/v2` (REST base) by trimming the suffix
  if (normalizedBase.endsWith('/api/v2')) {
    return `${normalizedBase.slice(
      0,
      -'/api/v2'.length,
    )}${DEFAULT_GRAPHQL_PATH}`
  }

  if (normalizedBase.endsWith('/api')) {
    return `${normalizedBase}${DEFAULT_GRAPHQL_PATH.replace('/api', '')}`
  }

  return `${normalizedBase}${DEFAULT_GRAPHQL_PATH}`
}

const isBrowser = typeof window !== 'undefined'

export interface GraphqlResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const endpoint = resolveGraphqlUrl()
  const token = isBrowser
    ? window.localStorage.getItem(TOKEN_STORAGE_KEY)
    : null

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-OmnivoreClient': 'web',
    },
    credentials: 'include',
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed (${response.status})`)
  }

  const payload = (await response.json()) as GraphqlResponse<T>
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(', '))
  }

  if (!payload.data) {
    throw new Error('GraphQL response missing data')
  }

  return payload.data
}

// ==================== MUTATIONS ====================

const ARCHIVE_LIBRARY_ITEM_MUTATION = `
  mutation ArchiveLibraryItem($id: String!, $archived: Boolean!) {
    archiveLibraryItem(id: $id, archived: $archived) {
      id
      state
      folder
      updatedAt
    }
  }
`

const DELETE_LIBRARY_ITEM_MUTATION = `
  mutation DeleteLibraryItem($id: String!) {
    deleteLibraryItem(id: $id) {
      success
      message
      itemId
    }
  }
`

const MOVE_LIBRARY_ITEM_TO_FOLDER_MUTATION = `
  mutation MoveLibraryItemToFolder($id: String!, $folder: String!) {
    moveLibraryItemToFolder(id: $id, folder: $folder) {
      id
      folder
      state
      updatedAt
    }
  }
`

const BULK_ARCHIVE_ITEMS_MUTATION = `
  mutation BulkArchiveItems($itemIds: [String!]!, $archived: Boolean!) {
    bulkArchiveItems(itemIds: $itemIds, archived: $archived) {
      success
      successCount
      failureCount
      errors
      message
    }
  }
`

const BULK_DELETE_ITEMS_MUTATION = `
  mutation BulkDeleteItems($itemIds: [String!]!) {
    bulkDeleteItems(itemIds: $itemIds) {
      success
      successCount
      failureCount
      errors
      message
    }
  }
`

const BULK_MOVE_TO_FOLDER_MUTATION = `
  mutation BulkMoveToFolder($itemIds: [String!]!, $folder: String!) {
    bulkMoveToFolder(itemIds: $itemIds, folder: $folder) {
      success
      successCount
      failureCount
      errors
      message
    }
  }
`

const BULK_MARK_AS_READ_MUTATION = `
  mutation BulkMarkAsRead($itemIds: [String!]!) {
    bulkMarkAsRead(itemIds: $itemIds) {
      success
      successCount
      failureCount
      errors
      message
    }
  }
`

const SAVE_URL_MUTATION = `
  ${LIBRARY_ITEM_FULL_FRAGMENT}
  ${LABEL_BASIC_FRAGMENT}
  mutation SaveUrl($input: SaveUrlInput!) {
    saveUrl(input: $input) {
      ...LibraryItemFullFields
    }
  }
`

// ==================== HOOKS ====================

interface MutationState<T> {
  loading: boolean
  error: Error | null
  data: T | null
}

export function useArchiveItem() {
  const [state, setState] = useState<MutationState<any>>({
    loading: false,
    error: null,
    data: null,
  })

  const archiveItem = useCallback(async (id: string, archived: boolean) => {
    setState({ loading: true, error: null, data: null })
    try {
      const data = await graphqlRequest(ARCHIVE_LIBRARY_ITEM_MUTATION, {
        id,
        archived,
      })
      setState({ loading: false, error: null, data })
      
      return data
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Archive failed')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, archiveItem }
}

export function useDeleteItem() {
  const [state, setState] = useState<MutationState<any>>({
    loading: false,
    error: null,
    data: null,
  })

  const deleteItem = useCallback(async (id: string) => {
    setState({ loading: true, error: null, data: null })
    try {
      const data = await graphqlRequest(DELETE_LIBRARY_ITEM_MUTATION, { id })
      setState({ loading: false, error: null, data })
      
      return data
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Delete failed')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, deleteItem }
}

export function useMoveToFolder() {
  const [state, setState] = useState<MutationState<any>>({
    loading: false,
    error: null,
    data: null,
  })

  const moveToFolder = useCallback(async (id: string, folder: string) => {
    setState({ loading: true, error: null, data: null })
    try {
      const data = await graphqlRequest(MOVE_LIBRARY_ITEM_TO_FOLDER_MUTATION, {
        id,
        folder,
      })
      setState({ loading: false, error: null, data })
      
      return data
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Move to folder failed')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, moveToFolder }
}

// ==================== BULK OPERATION HOOKS ====================

interface BulkActionResult {
  success: boolean
  successCount: number
  failureCount: number
  errors?: string[]
  message?: string
}

export function useBulkArchive() {
  const [state, setState] = useState<MutationState<BulkActionResult>>({
    loading: false,
    error: null,
    data: null,
  })

  const bulkArchive = useCallback(
    async (itemIds: string[], archived: boolean) => {
      setState({ loading: true, error: null, data: null })
      try {
        const result = await graphqlRequest<{
          bulkArchiveItems: BulkActionResult
        }>(BULK_ARCHIVE_ITEMS_MUTATION, { itemIds, archived })
        setState({ loading: false, error: null, data: result.bulkArchiveItems })
        
        return result.bulkArchiveItems
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('Bulk archive failed')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    [],
  )

  return { ...state, bulkArchive }
}

export function useBulkDelete() {
  const [state, setState] = useState<MutationState<BulkActionResult>>({
    loading: false,
    error: null,
    data: null,
  })

  const bulkDelete = useCallback(async (itemIds: string[]) => {
    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{
        bulkDeleteItems: BulkActionResult
      }>(BULK_DELETE_ITEMS_MUTATION, { itemIds })
      setState({ loading: false, error: null, data: result.bulkDeleteItems })
      
      return result.bulkDeleteItems
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Bulk delete failed')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, bulkDelete }
}

export function useBulkMoveToFolder() {
  const [state, setState] = useState<MutationState<BulkActionResult>>({
    loading: false,
    error: null,
    data: null,
  })

  const bulkMoveToFolder = useCallback(
    async (itemIds: string[], folder: string) => {
      setState({ loading: true, error: null, data: null })
      try {
        const result = await graphqlRequest<{
          bulkMoveToFolder: BulkActionResult
        }>(BULK_MOVE_TO_FOLDER_MUTATION, { itemIds, folder })
        setState({ loading: false, error: null, data: result.bulkMoveToFolder })
        
        return result.bulkMoveToFolder
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Bulk move to folder failed')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    [],
  )

  return { ...state, bulkMoveToFolder }
}

export function useBulkMarkAsRead() {
  const [state, setState] = useState<MutationState<BulkActionResult>>({
    loading: false,
    error: null,
    data: null,
  })

  const bulkMarkAsRead = useCallback(async (itemIds: string[]) => {
    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{
        bulkMarkAsRead: BulkActionResult
      }>(BULK_MARK_AS_READ_MUTATION, { itemIds })
      setState({ loading: false, error: null, data: result.bulkMarkAsRead })
      
      return result.bulkMarkAsRead
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Bulk mark as read failed')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, bulkMarkAsRead }
}

export function useSaveUrl() {
  const [state, setState] = useState<MutationState<any>>({
    loading: false,
    error: null,
    data: null,
  })

  const saveUrl = useCallback(
    async (input: { url: string; folder?: string }) => {
      setState({ loading: true, error: null, data: null })
      try {
        const result = await graphqlRequest<{ saveUrl: any }>(
          SAVE_URL_MUTATION,
          { input },
        )
        setState({ loading: false, error: null, data: result.saveUrl })
        
        return result.saveUrl
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('Save URL failed')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    [],
  )

  return { ...state, saveUrl }
}

// ==================== LABEL TYPES ====================

export interface Label {
  id: string
  name: string
  color: string
  description?: string | null
  position: number
  internal: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLabelInput {
  name: string
  color?: string
  description?: string
}

export interface UpdateLabelInput {
  name?: string
  color?: string
  description?: string
}

// ==================== LIBRARY ITEM QUERIES ====================

const GET_LIBRARY_ITEM_QUERY = `
  ${LIBRARY_ITEM_FULL_FRAGMENT}
  ${LABEL_BASIC_FRAGMENT}
  query GetLibraryItem($id: String!) {
    libraryItem(id: $id) {
      ...LibraryItemFullFields
    }
  }
`

// Batched query for reader page - fetches item + highlights in one request
const GET_READER_PAGE_DATA_QUERY = `
  ${LIBRARY_ITEM_FULL_FRAGMENT}
  ${LABEL_FRAGMENT}
  ${HIGHLIGHT_FRAGMENT}
  query GetReaderPageData($id: String!) {
    libraryItem(id: $id) {
      ...LibraryItemFullFields
    }
    highlights(libraryItemId: $id) {
      ...HighlightFields
    }
  }
`

// ==================== LABEL QUERIES ====================

const GET_LABELS_QUERY = `
  ${LABEL_FRAGMENT}
  query GetLabels {
    labels {
      ...LabelFields
    }
  }
`

const GET_LABEL_QUERY = `
  ${LABEL_FRAGMENT}
  query GetLabel($id: String!) {
    label(id: $id) {
      ...LabelFields
    }
  }
`

// ==================== LABEL MUTATIONS ====================

const CREATE_LABEL_MUTATION = `
  ${LABEL_FRAGMENT}
  mutation CreateLabel($input: CreateLabelInput!) {
    createLabel(input: $input) {
      ...LabelFields
    }
  }
`

const UPDATE_LABEL_MUTATION = `
  ${LABEL_FRAGMENT}
  mutation UpdateLabel($id: String!, $input: UpdateLabelInput!) {
    updateLabel(id: $id, input: $input) {
      ...LabelFields
    }
  }
`

const DELETE_LABEL_MUTATION = `
  mutation DeleteLabel($id: String!) {
    deleteLabel(id: $id) {
      success
      message
      itemId
    }
  }
`

const SET_LIBRARY_ITEM_LABELS_MUTATION = `
  ${LABEL_BASIC_FRAGMENT}
  mutation SetLibraryItemLabels($itemId: String!, $labelIds: [String!]!) {
    setLibraryItemLabels(itemId: $itemId, labelIds: $labelIds) {
      ...LabelBasicFields
    }
  }
`

const UPDATE_LIBRARY_ITEM_MUTATION = `
  mutation UpdateLibraryItem($id: String!, $input: UpdateLibraryItemInput!) {
    updateLibraryItem(id: $id, input: $input) {
      id
      title
      author
      description
      readAt
      updatedAt
    }
  }
`

// ==================== LABEL HOOKS ====================

export function useLabels() {
  const [state, setState] = useState<{
    loading: boolean
    error: Error | null
    data: Label[] | null
  }>({
    loading: false,
    error: null,
    data: null,
  })

  const fetchLabels = useCallback(async () => {
    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{ labels: Label[] }>(GET_LABELS_QUERY)
      setState({ loading: false, error: null, data: result.labels })
      
      return result.labels
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to fetch labels')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, fetchLabels, refetch: fetchLabels }
}

export function useCreateLabel() {
  const [state, setState] = useState<MutationState<Label>>({
    loading: false,
    error: null,
    data: null,
  })

  const createLabel = useCallback(async (input: CreateLabelInput) => {
    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{ createLabel: Label }>(
        CREATE_LABEL_MUTATION,
        { input },
      )
      setState({ loading: false, error: null, data: result.createLabel })
      
      return result.createLabel
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to create label')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, createLabel }
}

export function useUpdateLabel() {
  const [state, setState] = useState<MutationState<Label>>({
    loading: false,
    error: null,
    data: null,
  })

  const updateLabel = useCallback(
    async (id: string, input: UpdateLabelInput) => {
      setState({ loading: true, error: null, data: null })
      try {
        const result = await graphqlRequest<{ updateLabel: Label }>(
          UPDATE_LABEL_MUTATION,
          { id, input },
        )
        setState({ loading: false, error: null, data: result.updateLabel })
        
        return result.updateLabel
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('Failed to update label')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    [],
  )

  return { ...state, updateLabel }
}

export function useDeleteLabel() {
  const [state, setState] = useState<MutationState<DeleteResult>>({
    loading: false,
    error: null,
    data: null,
  })

  const deleteLabel = useCallback(async (id: string) => {
    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{ deleteLabel: DeleteResult }>(
        DELETE_LABEL_MUTATION,
        { id },
      )
      setState({ loading: false, error: null, data: result.deleteLabel })
      
      return result.deleteLabel
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to delete label')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, deleteLabel }
}

export function useSetLibraryItemLabels() {
  const [state, setState] = useState<MutationState<Label[]>>({
    loading: false,
    error: null,
    data: null,
  })

  const setLibraryItemLabels = useCallback(
    async (itemId: string, labelIds: string[]) => {
      setState({ loading: true, error: null, data: null })
      try {
        const result = await graphqlRequest<{
          setLibraryItemLabels: Label[]
        }>(SET_LIBRARY_ITEM_LABELS_MUTATION, { itemId, labelIds })
        setState({
          loading: false,
          error: null,
          data: result.setLibraryItemLabels,
        })
        
        return result.setLibraryItemLabels
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Failed to set item labels')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    [],
  )

  return { ...state, setLibraryItemLabels }
}

// ==================== LIBRARY ITEM HOOKS ====================

export function useLibraryItem(id: string) {
  const [state, setState] = useState<{
    loading: boolean
    error: Error | null
    data: LibraryItem | null
  }>({
    loading: false,
    error: null,
    data: null,
  })

  const fetchLibraryItem = useCallback(async () => {
    if (!id) return

    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{ libraryItem: LibraryItem | null }>(
        GET_LIBRARY_ITEM_QUERY,
        { id },
      )
      setState({ loading: false, error: null, data: result.libraryItem })
      
      return result.libraryItem
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Failed to fetch library item')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [id])

  return { ...state, fetchLibraryItem }
}

// Batched hook for reader page - fetches item + highlights in one request
export function useReaderPageData(id: string) {
  const [state, setState] = useState<{
    loading: boolean
    error: Error | null
    item: LibraryItem | null
    highlights: Highlight[] | null
  }>({
    loading: false,
    error: null,
    item: null,
    highlights: null,
  })

  const fetchReaderPageData = useCallback(async () => {
    if (!id) return

    setState({ loading: true, error: null, item: null, highlights: null })
    try {
      const result = await graphqlRequest<{
        libraryItem: LibraryItem | null
        highlights: Highlight[]
      }>(GET_READER_PAGE_DATA_QUERY, { id })

      setState({
        loading: false,
        error: null,
        item: result.libraryItem,
        highlights: result.highlights || [],
      })
      
      return { item: result.libraryItem, highlights: result.highlights }
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Failed to fetch reader page data')
      setState({ loading: false, error: err, item: null, highlights: null })
      throw err
    }
  }, [id])

  return { ...state, fetchReaderPageData }
}

export interface UpdateLibraryItemInput {
  title?: string
  author?: string
  description?: string
  readAt?: string | null
}

export function useUpdateLibraryItem() {
  const [state, setState] = useState<MutationState<any>>({
    loading: false,
    error: null,
    data: null,
  })

  const updateLibraryItem = useCallback(
    async (id: string, input: UpdateLibraryItemInput) => {
      setState({ loading: true, error: null, data: null })
      try {
        const result = await graphqlRequest<{ updateLibraryItem: any }>(
          UPDATE_LIBRARY_ITEM_MUTATION,
          { id, input },
        )
        setState({
          loading: false,
          error: null,
          data: result.updateLibraryItem,
        })
        
        return result.updateLibraryItem
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Failed to update library item')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    [],
  )

  return { ...state, updateLibraryItem }
}

// ==================== HIGHLIGHT TYPES ====================

export interface Highlight {
  id: string
  shortId: string
  libraryItemId: string
  quote: string | null
  prefix: string | null
  suffix: string | null
  patch: string | null
  annotation: string | null
  createdAt: string
  updatedAt: string
  sharedAt: string | null
  highlightPositionPercent: number
  highlightPositionAnchorIndex: number
  highlightType: 'HIGHLIGHT' | 'REDACTION' | 'NOTE'
  html: string | null
  color: HighlightColor
  representation: 'CONTENT' | 'FEED_CONTENT'
  selectors: Record<string, any> | null // AnchoredSelectors object (GraphQLJSON scalar)
  contentVersion?: string | null
}

export interface CreateHighlightInput {
  libraryItemId: string
  quote: string
  annotation?: string
  color?: HighlightColor
  prefix?: string
  suffix?: string
  highlightPositionPercent: number
  highlightPositionAnchorIndex?: number
  selectors?: Record<string, any> // AnchoredSelectors object (GraphQLJSON scalar)
  contentVersion?: string
}

export interface UpdateHighlightInput {
  annotation?: string
  color?: HighlightColor
}

// ==================== HIGHLIGHT QUERIES ====================

const GET_HIGHLIGHTS_QUERY = `
  ${HIGHLIGHT_FRAGMENT}
  query GetHighlights($libraryItemId: String!) {
    highlights(libraryItemId: $libraryItemId) {
      ...HighlightFields
    }
  }
`

const GET_HIGHLIGHT_QUERY = `
  ${HIGHLIGHT_FRAGMENT}
  query GetHighlight($id: String!) {
    highlight(id: $id) {
      ...HighlightFields
    }
  }
`

// ==================== HIGHLIGHT MUTATIONS ====================

const CREATE_HIGHLIGHT_MUTATION = `
  ${HIGHLIGHT_FRAGMENT}
  mutation CreateHighlight($input: CreateHighlightInput!) {
    createHighlight(input: $input) {
      ...HighlightFields
    }
  }
`

const UPDATE_HIGHLIGHT_MUTATION = `
  ${HIGHLIGHT_FRAGMENT}
  mutation UpdateHighlight($id: String!, $input: UpdateHighlightInput!) {
    updateHighlight(id: $id, input: $input) {
      ...HighlightFields
    }
  }
`

const DELETE_HIGHLIGHT_MUTATION = `
  mutation DeleteHighlight($id: String!) {
    deleteHighlight(id: $id) {
      success
      message
      itemId
    }
  }
`

// ==================== HIGHLIGHT HOOKS ====================

export function useHighlights(libraryItemId: string) {
  const [state, setState] = useState<{
    loading: boolean
    error: Error | null
    data: Highlight[] | null
  }>({
    loading: false,
    error: null,
    data: null,
  })

  const fetchHighlights = useCallback(async () => {
    if (!libraryItemId) return

    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{ highlights: Highlight[] }>(
        GET_HIGHLIGHTS_QUERY,
        { libraryItemId },
      )
      setState({ loading: false, error: null, data: result.highlights })
      
      return result.highlights
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to fetch highlights')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [libraryItemId])

  return { ...state, fetchHighlights, refetch: fetchHighlights }
}

export function useCreateHighlight() {
  const [state, setState] = useState<MutationState<Highlight>>({
    loading: false,
    error: null,
    data: null,
  })

  const createHighlight = useCallback(async (input: CreateHighlightInput) => {
    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{ createHighlight: Highlight }>(
        CREATE_HIGHLIGHT_MUTATION,
        { input },
      )
      setState({ loading: false, error: null, data: result.createHighlight })
      
      return result.createHighlight
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to create highlight')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, createHighlight }
}

export function useUpdateHighlight() {
  const [state, setState] = useState<MutationState<Highlight>>({
    loading: false,
    error: null,
    data: null,
  })

  const updateHighlight = useCallback(
    async (id: string, input: UpdateHighlightInput) => {
      setState({ loading: true, error: null, data: null })
      try {
        const result = await graphqlRequest<{ updateHighlight: Highlight }>(
          UPDATE_HIGHLIGHT_MUTATION,
          { id, input },
        )
        setState({ loading: false, error: null, data: result.updateHighlight })
        
        return result.updateHighlight
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Failed to update highlight')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    [],
  )

  return { ...state, updateHighlight }
}

export function useDeleteHighlight() {
  const [state, setState] = useState<MutationState<DeleteResult>>({
    loading: false,
    error: null,
    data: null,
  })

  const deleteHighlight = useCallback(async (id: string) => {
    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{ deleteHighlight: DeleteResult }>(
        DELETE_HIGHLIGHT_MUTATION,
        { id },
      )
      setState({ loading: false, error: null, data: result.deleteHighlight })
      
      return result.deleteHighlight
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to delete highlight')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, deleteHighlight }
}

// ==================== NOTEBOOK MUTATIONS ====================

const UPDATE_NOTEBOOK_MUTATION = `
  mutation UpdateNotebook($id: String!, $input: UpdateNotebookInput!) {
    updateNotebook(id: $id, input: $input) {
      id
      note
      noteUpdatedAt
      updatedAt
    }
  }
`

// ==================== NOTEBOOK HOOKS ====================

export interface UpdateNotebookInput {
  note: string
}

export function useUpdateNotebook() {
  const [state, setState] = useState<MutationState<LibraryItem>>({
    loading: false,
    error: null,
    data: null,
  })

  const updateNotebook = useCallback(async (itemId: string, note: string) => {
    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{ updateNotebook: LibraryItem }>(
        UPDATE_NOTEBOOK_MUTATION,
        { id: itemId, input: { note } },
      )
      setState({ loading: false, error: null, data: result.updateNotebook })
      
      return result.updateNotebook
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to update notebook')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [])

  return { ...state, updateNotebook }
}

// ==================== READING PROGRESS TYPES ====================

export interface ReadingProgress {
  id: string
  libraryItemId: string
  contentVersion: string | null
  lastSeenSentinel: number
  highestSeenSentinel: number
  createdAt: string
  updatedAt: string
}

export interface UpdateReadingProgressInput {
  libraryItemId: string
  contentVersion?: string
  lastSeenSentinel: number
  highestSeenSentinel: number
  totalSentinels?: number
}

// ==================== READING PROGRESS QUERIES ====================

const GET_READING_PROGRESS_QUERY = `
  ${READING_PROGRESS_FRAGMENT}
  query GetReadingProgress($libraryItemId: String!, $contentVersion: String) {
    readingProgress(libraryItemId: $libraryItemId, contentVersion: $contentVersion) {
      ...ReadingProgressFields
    }
  }
`

// ==================== READING PROGRESS MUTATIONS ====================

const UPDATE_READING_PROGRESS_MUTATION = `
  ${READING_PROGRESS_FRAGMENT}
  mutation UpdateReadingProgress($input: UpdateReadingProgressInput!) {
    updateReadingProgress(input: $input) {
      ...ReadingProgressFields
    }
  }
`

// ==================== READING PROGRESS HOOKS ====================

export function useReadingProgress(
  libraryItemId: string,
  contentVersion?: string,
) {
  const [state, setState] = useState<{
    loading: boolean
    error: Error | null
    data: ReadingProgress | null
  }>({
    loading: false,
    error: null,
    data: null,
  })

  const fetchProgress = useCallback(async () => {
    if (!libraryItemId) return

    setState({ loading: true, error: null, data: null })
    try {
      const result = await graphqlRequest<{
        readingProgress: ReadingProgress | null
      }>(GET_READING_PROGRESS_QUERY, { libraryItemId, contentVersion })
      setState({ loading: false, error: null, data: result.readingProgress })
      
      return result.readingProgress
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Failed to fetch reading progress')
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [libraryItemId, contentVersion])

  return { ...state, fetchProgress, refetch: fetchProgress }
}

export function useUpdateReadingProgress() {
  const [state, setState] = useState<MutationState<ReadingProgress>>({
    loading: false,
    error: null,
    data: null,
  })

  const updateProgress = useCallback(
    async (input: UpdateReadingProgressInput) => {
      setState({ loading: true, error: null, data: null })
      try {
        const result = await graphqlRequest<{
          updateReadingProgress: ReadingProgress
        }>(UPDATE_READING_PROGRESS_MUTATION, { input })
        setState({
          loading: false,
          error: null,
          data: result.updateReadingProgress,
        })
        
        return result.updateReadingProgress
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Failed to update reading progress')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    [],
  )

  return { ...state, updateProgress }
}
