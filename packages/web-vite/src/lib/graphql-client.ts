// Minimal GraphQL helper targeting the NestJS `/api/graphql` endpoint
// Mirrors the behaviour of the legacy web package's fetcher but keeps dependencies light

import { useState, useCallback } from 'react'

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
      -'/api/v2'.length
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
  variables?: Record<string, unknown>
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

const UPDATE_READING_PROGRESS_MUTATION = `
  mutation UpdateReadingProgress($id: String!, $progress: ReadingProgressInput!) {
    updateReadingProgress(id: $id, progress: $progress) {
      id
      readingProgressTopPercent
      readingProgressBottomPercent
      readAt
      updatedAt
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

export function useUpdateReadingProgress() {
  const [state, setState] = useState<MutationState<any>>({
    loading: false,
    error: null,
    data: null,
  })

  const updateProgress = useCallback(
    async (
      id: string,
      progress: {
        readingProgressTopPercent: number
        readingProgressBottomPercent: number
        readingProgressAnchorIndex?: number
        readingProgressHighestAnchor?: number
      }
    ) => {
      setState({ loading: true, error: null, data: null })
      try {
        const data = await graphqlRequest(UPDATE_READING_PROGRESS_MUTATION, {
          id,
          progress,
        })
        setState({ loading: false, error: null, data })
        return data
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('Update progress failed')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    []
  )

  return { ...state, updateProgress }
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
    []
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
      const result = await graphqlRequest<{ bulkDeleteItems: BulkActionResult }>(
        BULK_DELETE_ITEMS_MUTATION,
        { itemIds }
      )
      setState({ loading: false, error: null, data: result.bulkDeleteItems })
      return result.bulkDeleteItems
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Bulk delete failed')
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
          error instanceof Error ? error : new Error('Bulk move to folder failed')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    []
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

// ==================== LABEL QUERIES ====================

const GET_LABELS_QUERY = `
  query GetLabels {
    labels {
      id
      name
      color
      description
      position
      internal
      createdAt
      updatedAt
    }
  }
`

const GET_LABEL_QUERY = `
  query GetLabel($id: String!) {
    label(id: $id) {
      id
      name
      color
      description
      position
      internal
      createdAt
      updatedAt
    }
  }
`

// ==================== LABEL MUTATIONS ====================

const CREATE_LABEL_MUTATION = `
  mutation CreateLabel($input: CreateLabelInput!) {
    createLabel(input: $input) {
      id
      name
      color
      description
      position
      internal
      createdAt
      updatedAt
    }
  }
`

const UPDATE_LABEL_MUTATION = `
  mutation UpdateLabel($id: String!, $input: UpdateLabelInput!) {
    updateLabel(id: $id, input: $input) {
      id
      name
      color
      description
      position
      internal
      updatedAt
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
  mutation SetLibraryItemLabels($itemId: String!, $labelIds: [String!]!) {
    setLibraryItemLabels(itemId: $itemId, labelIds: $labelIds) {
      id
      name
      color
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
      const err = error instanceof Error ? error : new Error('Failed to fetch labels')
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
        { input }
      )
      setState({ loading: false, error: null, data: result.createLabel })
      return result.createLabel
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create label')
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
          { id, input }
        )
        setState({ loading: false, error: null, data: result.updateLabel })
        return result.updateLabel
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to update label')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    []
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
        { id }
      )
      setState({ loading: false, error: null, data: result.deleteLabel })
      return result.deleteLabel
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete label')
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
          error instanceof Error ? error : new Error('Failed to set item labels')
        setState({ loading: false, error: err, data: null })
        throw err
      }
    },
    []
  )

  return { ...state, setLibraryItemLabels }
}
