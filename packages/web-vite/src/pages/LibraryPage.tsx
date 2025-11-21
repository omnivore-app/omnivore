// Library page component for Omnivore Vite migration
// Uses the new NestJS GraphQL endpoint to fetch the user's library items

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AddLinkModal from '../components/AddLinkModal'
import EditInfoModal from '../components/EditInfoModal'
import ErrorBoundary from '../components/ErrorBoundary'
import LabelPickerModal from '../components/LabelPickerModal'
import LibraryItemCard, { type CardAction } from '../components/LibraryItemCard'
import LibraryItemRow from '../components/LibraryItemRow'
import NotebookModal from '../components/NotebookModal'
import {
  graphqlRequest,
  useArchiveItem,
  useBulkArchive,
  useBulkDelete,
  useBulkMarkAsRead,
  useBulkMoveToFolder,
  useDeleteItem,
  useLabels,
  useSetLibraryItemLabels,
  useUpdateLibraryItem,
  useUpdateNotebook,
} from '../lib/graphql-client'
import {
  LABEL_BASIC_FRAGMENT,
  LIBRARY_ITEM_BASIC_FRAGMENT,
} from '../lib/graphql-fragments'
import { useAuthStore } from '../stores'
import type {
  LibraryItem as LibraryItemType,
  LibraryItemsConnection,
  LibraryItemState,
  LibrarySearchInput,
  LibrarySortBy,
  LibrarySortOrder,
} from '../types/api'
// CSS imported via consolidated bundle in main.tsx

const LIBRARY_ITEMS_QUERY = `
  ${LIBRARY_ITEM_BASIC_FRAGMENT}
  ${LABEL_BASIC_FRAGMENT}
  query LibraryItems($first: Int!, $after: String, $search: LibrarySearchInput) {
    libraryItems(first: $first, after: $after, search: $search) {
      items {
        ...LibraryItemBasicFields
        labels {
          ...LabelBasicFields
        }
      }
      nextCursor
    }
  }
`

const INITIAL_PAGE_SIZE = 50

const LibraryPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [items, setItems] = useState<LibraryItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFolder, setActiveFolder] = useState<string>('inbox')
  const [sortBy, setSortBy] = useState<LibrarySortBy>('SAVED_AT')
  const [sortOrder, setSortOrder] = useState<LibrarySortOrder>('DESC')
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [processingItemId, setProcessingItemId] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedLabelFilters, setSelectedLabelFilters] = useState<string[]>([])
  const [showLabelFilter, setShowLabelFilter] = useState(false)
  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    // Load view mode from localStorage, default to 'grid'
    const saved = localStorage.getItem('omnivore-view-mode')

    return saved === 'grid' || saved === 'list' ? saved : 'grid'
  })
  const [editingLabelsItemId, setEditingLabelsItemId] = useState<string | null>(
    null,
  )
  const [editingInfoItemId, setEditingInfoItemId] = useState<string | null>(
    null,
  )
  const [notebookItemId, setNotebookItemId] = useState<string | null>(null)

  const { archiveItem } = useArchiveItem()
  const { deleteItem } = useDeleteItem()
  const { bulkArchive } = useBulkArchive()
  const { bulkDelete } = useBulkDelete()
  const { bulkMoveToFolder } = useBulkMoveToFolder()
  const { bulkMarkAsRead } = useBulkMarkAsRead()
  const { updateLibraryItem } = useUpdateLibraryItem()
  const { updateNotebook } = useUpdateNotebook()
  const { setLibraryItemLabels } = useSetLibraryItemLabels()
  const { data: allLabels, fetchLabels } = useLabels()

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem('omnivore-view-mode', viewMode)
  }, [viewMode])

  // Polling for processing items
  useEffect(() => {
    const processingItems = items.filter(
      (i) => i.state === 'CONTENT_NOT_FETCHED' || i.state === 'PROCESSING',
    )

    if (processingItems.length === 0) return

    const pollInterval = setInterval(async () => {
      try {
        // Build search parameters
        const searchParams: LibrarySearchInput = {}
        if (searchQuery.trim()) {
          searchParams.query = searchQuery.trim()
        }
        if (activeFolder) {
          searchParams.folder = activeFolder
        }
        if (selectedLabelFilters.length > 0) {
          searchParams.labels = selectedLabelFilters
        }
        searchParams.sortBy = sortBy
        searchParams.sortOrder = sortOrder

        const data = await graphqlRequest<{
          libraryItems: LibraryItemsConnection
        }>(LIBRARY_ITEMS_QUERY, {
          first: INITIAL_PAGE_SIZE,
          search:
            Object.keys(searchParams).length > 0 ? searchParams : undefined,
        })

        // Check which items finished processing
        const nowReady = data.libraryItems.items.filter((item) =>
          processingItems.some(
            (p) => p.id === item.id && item.state === 'SUCCEEDED',
          ),
        )

        if (nowReady.length > 0) {
          showToast(
            `${nowReady.length} article${
              nowReady.length > 1 ? 's' : ''
            } ready to read!`,
            'success',
          )
        }

        setItems(data.libraryItems.items)
      } catch (err) {
        console.error('Failed to poll for processing items:', err)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(pollInterval)
  }, [
    items,
    searchQuery,
    activeFolder,
    selectedLabelFilters,
    sortBy,
    sortOrder,
  ])

  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return

      try {
        // Use searching state for filter/search changes (less jarring than full loading)
        // Use loading state only for initial page load
        if (items.length === 0) {
          setLoading(true)
        } else {
          setSearching(true)
        }

        // Build search parameters
        const searchParams: LibrarySearchInput = {}
        if (searchQuery.trim()) {
          searchParams.query = searchQuery.trim()
        }
        if (activeFolder) {
          searchParams.folder = activeFolder
        }
        if (selectedLabelFilters.length > 0) {
          searchParams.labels = selectedLabelFilters
        }
        searchParams.sortBy = sortBy
        searchParams.sortOrder = sortOrder

        const data = await graphqlRequest<{
          libraryItems: LibraryItemsConnection
        }>(LIBRARY_ITEMS_QUERY, {
          first: INITIAL_PAGE_SIZE,
          search:
            Object.keys(searchParams).length > 0 ? searchParams : undefined,
        })

        setItems(data.libraryItems.items)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load your library',
        )
      } finally {
        setLoading(false)
        setSearching(false)
      }
    }

    // Debounce search query - shorter for better UX
    const debounceTimer = setTimeout(fetchItems, searchQuery ? 300 : 0)
    
    return () => clearTimeout(debounceTimer)
  }, [
    user,
    searchQuery,
    activeFolder,
    sortBy,
    sortOrder,
    selectedLabelFilters,
    items.length,
  ])

  // Client-side filtering to reflect optimistic updates before server refetch
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by active folder
      if (activeFolder === 'inbox' && item.folder !== 'inbox') return false
      if (activeFolder === 'archive' && item.folder !== 'archive') return false
      if (activeFolder === 'trash' && item.folder !== 'trash') return false
      
      return true
    })
  }, [items, activeFolder])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    
    return date.toLocaleDateString()
  }

  const getStateColor = (state: LibraryItemState) => {
    switch (state) {
      case 'SUCCEEDED':
        return '#4a9eff'
      case 'PROCESSING':
        return '#ffd700'
      case 'ARCHIVED':
        return '#999'
      case 'FAILED':
        return '#ff4d4f'
      default:
        return '#4a9eff'
    }
  }

  const getStateLabel = (state: LibraryItemState) => {
    switch (state) {
      case 'SUCCEEDED':
        return 'Saved'
      case 'PROCESSING':
        return 'Processing'
      case 'ARCHIVED':
        return 'Archived'
      case 'FAILED':
        return 'Failed'
      default:
        return state.charAt(0) + state.slice(1).toLowerCase()
    }
  }

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRead = (itemId: string) => {
    navigate(`/reader/${itemId}`)
  }

  const handleArchive = async (
    itemId: string,
    currentState: LibraryItemState,
  ) => {
    const isArchived = currentState === 'ARCHIVED'

    try {
      setProcessingItemId(itemId)

      // Optimistic update
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
              ...item,
              state: isArchived ? 'SUCCEEDED' : 'ARCHIVED',
              folder: isArchived ? 'inbox' : 'archive',
            }
            : item,
        ),
      )

      await archiveItem(itemId, !isArchived)
      showToast(isArchived ? 'Item unarchived' : 'Item archived', 'success')
    } catch (err) {
      // Revert optimistic update on error
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, state: currentState } : item,
        ),
      )
      showToast(err instanceof Error ? err.message : 'Action failed', 'error')
    } finally {
      setProcessingItemId(null)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      setProcessingItemId(itemId)

      // Optimistic update - remove from list
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))

      await deleteItem(itemId)
      showToast('Item deleted', 'success')
    } catch (err) {
      // Refetch on error
      window.location.reload()
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error')
    } finally {
      setProcessingItemId(null)
    }
  }

  // ==================== MULTI-SELECT HANDLERS ====================

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedItems(new Set(items.map((item) => item.id)))
  }

  const deselectAll = () => {
    setSelectedItems(new Set())
  }

  const handleBulkArchive = async (archived: boolean) => {
    if (selectedItems.size === 0) return

    try {
      const itemIds = Array.from(selectedItems)

      // Optimistic update
      setItems((prevItems) =>
        prevItems.map((item) =>
          selectedItems.has(item.id)
            ? {
              ...item,
              state: archived ? 'ARCHIVED' : 'SUCCEEDED',
              folder: archived ? 'archive' : 'inbox',
            }
            : item,
        ),
      )

      const result = await bulkArchive(itemIds, archived)
      showToast(
        result.message ||
          `${result.successCount} items ${
            archived ? 'archived' : 'unarchived'
          }`,
        'success',
      )

      if (result.failureCount > 0 && result.errors) {
        showToast(
          `Bulk archive errors: ${JSON.stringify(result.errors, null, 2)}`,
          'error',
        )
      }

      deselectAll()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Bulk archive failed',
        'error',
      )
      // Refetch to restore correct state
      window.location.reload()
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    if (
      !confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)
    ) {
      return
    }

    try {
      const itemIds = Array.from(selectedItems)

      // Optimistic update - remove from list
      setItems((prevItems) =>
        prevItems.filter((item) => !selectedItems.has(item.id)),
      )

      const result = await bulkDelete(itemIds)
      showToast(
        result.message || `${result.successCount} items deleted`,
        'success',
      )

      if (result.failureCount > 0 && result.errors) {
        console.error('Bulk delete errors:', result.errors)
      }

      deselectAll()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Bulk delete failed',
        'error',
      )
      window.location.reload()
    }
  }

  const handleBulkMoveToFolderAction = async (folder: string) => {
    if (selectedItems.size === 0) return

    try {
      const itemIds = Array.from(selectedItems)

      // Determine state based on folder
      let newState: LibraryItemState = 'SUCCEEDED'
      if (folder === 'archive') newState = 'ARCHIVED'
      if (folder === 'trash') newState = 'DELETED'

      // Optimistic update
      setItems((prevItems) =>
        prevItems.map((item) =>
          selectedItems.has(item.id)
            ? { ...item, folder, state: newState }
            : item,
        ),
      )

      const result = await bulkMoveToFolder(itemIds, folder)
      showToast(
        result.message || `${result.successCount} items moved to ${folder}`,
        'success',
      )

      if (result.failureCount > 0 && result.errors) {
        console.error('Bulk move errors:', result.errors)
      }

      deselectAll()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Bulk move failed',
        'error',
      )
      window.location.reload()
    }
  }

  const handleBulkMarkAsReadAction = async () => {
    if (selectedItems.size === 0) return

    try {
      const itemIds = Array.from(selectedItems)

      // Optimistic update - set readAt AND progress to 100%
      setItems((prevItems) =>
        prevItems.map((item) =>
          selectedItems.has(item.id)
            ? {
              ...item,
              readAt: new Date().toISOString(),
              readingProgressPercent: 100, // Show full green bar
            }
            : item,
        ),
      )

      const result = await bulkMarkAsRead(itemIds)
      showToast(
        result.message || `${result.successCount} items marked as read`,
        'success',
      )

      if (result.failureCount > 0 && result.errors) {
        console.error('Bulk mark as read errors:', result.errors)
      }

      deselectAll()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Bulk mark as read failed',
        'error',
      )
      window.location.reload()
    }
  }

  const handleLabelsUpdate = async (
    itemId: string,
    newLabelNames: string[],
  ) => {
    try {
      if (!allLabels) {
        showToast('Labels not loaded yet', 'error')

        return
      }

      // Convert label names to label IDs for the mutation
      const labelIds = newLabelNames
        .map((name) => allLabels.find((l) => l.name === name)?.id)
        .filter((id): id is string => id !== undefined)

      // Optimistic update - convert label names to Label objects
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === itemId && allLabels) {
            // Map label names to full Label objects from allLabels
            const updatedLabels = newLabelNames
              .map((name) => allLabels.find((l) => l.name === name))
              .filter((l): l is NonNullable<typeof l> => l !== null)

            return { ...item, labels: updatedLabels }
          }

          return item
        }),
      )

      // Call the mutation to persist labels to backend
      await setLibraryItemLabels(itemId, labelIds)
      showToast('Labels updated', 'success')

      // Refetch library items to get the actual updated data from server
      // This ensures the labels are persisted and the filter will work correctly
      const searchParams: LibrarySearchInput = {}
      if (searchQuery.trim()) {
        searchParams.query = searchQuery.trim()
      }
      if (activeFolder) {
        searchParams.folder = activeFolder
      }
      if (selectedLabelFilters.length > 0) {
        searchParams.labels = selectedLabelFilters
      }
      searchParams.sortBy = sortBy
      searchParams.sortOrder = sortOrder

      const data = await graphqlRequest<{
        libraryItems: LibraryItemsConnection
      }>(LIBRARY_ITEMS_QUERY, {
        first: INITIAL_PAGE_SIZE,
        search: Object.keys(searchParams).length > 0 ? searchParams : undefined,
      })

      setItems(data.libraryItems.items)
    } catch (err) {
      console.error('Failed to update labels:', err)
      showToast(
        err instanceof Error ? err.message : 'Failed to update labels',
        'error',
      )
      // Reload page to reset state on error
      window.location.reload()
    }
  }

  const handleInfoUpdate = async (
    itemId: string,
    updatedFields: Partial<LibraryItemType>,
  ) => {
    // Optimistic update
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, ...updatedFields } : item,
      ),
    )
    showToast('Info updated', 'success')
  }

  const handleNotebookSave = async (itemId: string, note: string) => {
    try {
      await updateNotebook(itemId, note)

      // Optimistic update
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, note, noteUpdatedAt: new Date().toISOString() }
            : item,
        ),
      )

      showToast('Notebook saved', 'success')
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save notebook',
        'error',
      )
      throw err // Re-throw so NotebookModal can handle it
    }
  }

  const handleMarkAsRead = async (itemId: string) => {
    try {
      setProcessingItemId(itemId)

      // Optimistic update - set readAt AND progress to 100% (full green bar)
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
              ...item,
              readAt: new Date().toISOString(),
              readingProgressPercent: 100, // Show full green bar
            }
            : item,
        ),
      )

      // Use bulkMarkAsRead with single item
      await bulkMarkAsRead([itemId])
      showToast('Marked as read', 'success')
    } catch (err) {
      // Revert optimistic update on error
      window.location.reload()
      showToast(err instanceof Error ? err.message : 'Action failed', 'error')
    } finally {
      setProcessingItemId(null)
    }
  }

  const handleMarkAsUnread = async (itemId: string) => {
    try {
      setProcessingItemId(itemId)

      // Optimistic update
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
              ...item,
              readAt: null,
            }
            : item,
        ),
      )

      // Use updateLibraryItem to set readAt to null
      const updatedItem = await updateLibraryItem(itemId, { readAt: null })

      // Update with actual response to ensure consistency
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
              ...item,
              readAt: updatedItem.readAt,
              updatedAt: updatedItem.updatedAt,
            }
            : item,
        ),
      )

      showToast('Marked as unread', 'success')
    } catch (err) {
      // Revert optimistic update on error
      window.location.reload()
      showToast(err instanceof Error ? err.message : 'Action failed', 'error')
    } finally {
      setProcessingItemId(null)
    }
  }

  // Unified action handler for card menu
  const handleCardAction = async (action: CardAction, itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    switch (action) {
      case 'archive':
      case 'unarchive':
        await handleArchive(itemId, item.state)
        break
      case 'delete':
        await handleDelete(itemId)
        break
      case 'set-labels':
        setEditingLabelsItemId(itemId)
        break
      case 'open-notebook':
        setNotebookItemId(itemId)
        break
      case 'open-original':
        if (item.originalUrl) {
          window.open(item.originalUrl, '_blank', 'noopener,noreferrer')
        }
        break
      case 'edit-info':
        setEditingInfoItemId(itemId)
        break
      case 'mark-read':
        await handleMarkAsRead(itemId)
        break
      case 'mark-unread':
        await handleMarkAsUnread(itemId)
        break
    }
  }

  const toggleLabelFilter = (labelName: string) => {
    setSelectedLabelFilters((prev) => {
      if (prev.includes(labelName)) {
        return prev.filter((l) => l !== labelName)
      }

      return [...prev, labelName]
    })
  }

  const clearLabelFilters = () => {
    setSelectedLabelFilters([])
  }

  const handleAddLinkSuccess = async () => {
    showToast('Link added successfully!', 'success')
    // Refetch library items
    try {
      const searchParams: LibrarySearchInput = {}
      if (searchQuery.trim()) {
        searchParams.query = searchQuery.trim()
      }
      if (activeFolder) {
        searchParams.folder = activeFolder
      }
      if (selectedLabelFilters.length > 0) {
        searchParams.labels = selectedLabelFilters
      }
      searchParams.sortBy = sortBy
      searchParams.sortOrder = sortOrder

      const data = await graphqlRequest<{
        libraryItems: LibraryItemsConnection
      }>(LIBRARY_ITEMS_QUERY, {
        first: INITIAL_PAGE_SIZE,
        search: Object.keys(searchParams).length > 0 ? searchParams : undefined,
      })

      setItems(data.libraryItems.items)
    } catch (err) {
      console.error('Failed to refetch library items:', err)
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading your library...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try again</button>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
      <div className="library-page">
        {/* Top Bar: Search + Add + User Menu */}
        <div className="library-top-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searching && <span className="search-spinner">⏳</span>}
          </div>
          <button
            type="button"
            className="btn btn-primary add-article-btn"
            onClick={() => setShowAddLinkModal(true)}
          >
            + Add
          </button>
        </div>

        {/* Filters Bar: Labels + View Toggle + Multi-Select + Sort */}
        <div className="library-filters-bar">
          <div className="filter-controls-left">
            <div className="label-filter-wrapper">
              <button
                type="button"
                className="btn btn-secondary label-filter-toggle-btn"
                onClick={() => setShowLabelFilter(!showLabelFilter)}
              >
                🏷️ Labels{' '}
                {selectedLabelFilters.length > 0 &&
                  `(${selectedLabelFilters.length})`}
              </button>
              {showLabelFilter && (
                <div className="label-filter-dropdown">
                  <div className="label-filter-header">
                    <h4>Filter by Labels</h4>
                    {selectedLabelFilters.length > 0 && (
                      <button
                        className="clear-filters-btn"
                        onClick={clearLabelFilters}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {allLabels && allLabels.length > 0 ? (
                    <div className="label-filter-list">
                      {allLabels.map((label) => (
                        <label key={label.id} className="label-filter-item">
                          <input
                            type="checkbox"
                            checked={selectedLabelFilters.includes(label.name)}
                            onChange={() => toggleLabelFilter(label.name)}
                          />
                          <span
                            className="label-color-dot"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="label-name">{label.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="label-filter-empty">
                      No labels available. Create labels from the Labels page.
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn btn-icon view-toggle-btn"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? '☰' : '⊞'}
            </button>
            <button
              type="button"
              className="btn btn-secondary multi-select-toggle-btn"
              onClick={() => {
                setIsMultiSelectMode(!isMultiSelectMode)
                if (isMultiSelectMode) {
                  deselectAll()
                }
              }}
            >
              ☑ {isMultiSelectMode ? 'Exit' : 'Select'}
            </button>
          </div>
          <div className="sort-controls">
            <label htmlFor="sort-by">Sort:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as LibrarySortBy)}
              className="sort-select"
            >
              <option value="SAVED_AT">Recent</option>
              <option value="UPDATED_AT">Updated</option>
              <option value="PUBLISHED_AT">Published</option>
              <option value="TITLE">Title</option>
              <option value="AUTHOR">Author</option>
            </select>
            <button
              type="button"
              className="btn btn-icon sort-order-btn"
              onClick={() =>
                setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')
              }
              title={sortOrder === 'DESC' ? 'Descending' : 'Ascending'}
            >
              {sortOrder === 'DESC' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        <AddLinkModal
          isOpen={showAddLinkModal}
          onClose={() => setShowAddLinkModal(false)}
          onSuccess={handleAddLinkSuccess}
        />

        {/* Label Picker Modal */}
        {editingLabelsItemId &&
          (() => {
            const editingItem = items.find((i) => i.id === editingLabelsItemId)
            if (!editingItem) return null

            return (
              <LabelPickerModal
                itemId={editingItem.id}
                currentLabels={editingItem.labels?.map((l) => l.name) || []}
                onUpdate={(labelNames) => {
                  handleLabelsUpdate(editingItem.id, labelNames)
                  setEditingLabelsItemId(null)
                }}
                onClose={() => setEditingLabelsItemId(null)}
              />
            )
          })()}

        {/* Edit Info Modal */}
        {editingInfoItemId &&
          (() => {
            const editingItem = items.find((i) => i.id === editingInfoItemId)
            if (!editingItem) return null

            return (
              <EditInfoModal
                itemId={editingItem.id}
                currentTitle={editingItem.title}
                currentAuthor={editingItem.author}
                currentDescription={editingItem.description}
                onUpdate={(updatedFields) => {
                  handleInfoUpdate(editingItem.id, updatedFields)
                  setEditingInfoItemId(null)
                }}
                onClose={() => setEditingInfoItemId(null)}
              />
            )
          })()}

        {/* Notebook Modal */}
        {notebookItemId &&
          (() => {
            const notebookItem = items.find((i) => i.id === notebookItemId)
            if (!notebookItem) return null

            return (
              <NotebookModal
                itemTitle={notebookItem.title}
                currentNote={notebookItem.note}
                onSave={(note) => handleNotebookSave(notebookItem.id, note)}
                onClose={() => setNotebookItemId(null)}
              />
            )
          })()}

        {isMultiSelectMode && (
          <div className="bulk-actions-bar">
            <div className="bulk-select-controls">
              <button
                type="button"
                onClick={selectAll}
                className="btn btn-secondary bulk-control-btn"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="btn btn-secondary bulk-control-btn"
              >
                Deselect All
              </button>
              <span className="selected-count">
                {selectedItems.size} of {items.length} selected
              </span>
            </div>
            {selectedItems.size > 0 && (
              <div className="bulk-action-buttons">
                <button
                  type="button"
                  onClick={() => handleBulkArchive(true)}
                  className="btn btn-secondary bulk-action-btn"
                >
                  Archive Selected
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkArchive(false)}
                  className="btn btn-secondary bulk-action-btn"
                >
                  Unarchive Selected
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMoveToFolderAction('inbox')}
                  className="btn btn-secondary bulk-action-btn"
                >
                  Move to Inbox
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMoveToFolderAction('archive')}
                  className="btn btn-secondary bulk-action-btn"
                >
                  Move to Archive
                </button>
                <button
                  type="button"
                  onClick={handleBulkMarkAsReadAction}
                  className="btn btn-secondary bulk-action-btn"
                >
                  Mark as Read
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="btn btn-danger bulk-action-btn bulk-action-btn-danger"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        )}

        {/* Folder Tabs: Inbox, Archive, Trash */}
        <div className="library-folder-tabs">
          <button
            type="button"
            className={`folder-tab ${activeFolder === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveFolder('inbox')}
          >
            Inbox
          </button>
          <button
            type="button"
            className={`folder-tab ${
              activeFolder === 'archive' ? 'active' : ''
            }`}
            onClick={() => setActiveFolder('archive')}
          >
            Archive
          </button>
          <button
            type="button"
            className={`folder-tab ${activeFolder === 'trash' ? 'active' : ''}`}
            onClick={() => setActiveFolder('trash')}
          >
            Trash
          </button>
          {selectedItems.size > 0 && (
            <span className="selection-indicator">
              {selectedItems.size} selected
            </span>
          )}
        </div>

        <div className="library-stats">
          <div className="stat">
            <span className="stat-number">{items.length}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {items.filter((item) => item.state === 'SUCCEEDED').length}
            </span>
            <span className="stat-label">Saved</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {items.filter((item) => item.state === 'ARCHIVED').length}
            </span>
            <span className="stat-label">Archived</span>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <h2>No items found</h2>
            <p>
              {searchQuery
                ? `No items match "${searchQuery}"`
                : 'Your library is empty. Add some articles to get started!'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                className="btn btn-primary add-article-btn"
                onClick={() => setShowAddLinkModal(true)}
              >
                + Add Your First Article
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="articles-grid">
            {filteredItems.map((item) => (
              <LibraryItemCard
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                isMultiSelectMode={isMultiSelectMode}
                onRead={handleRead}
                onAction={handleCardAction}
                onToggleSelect={toggleItemSelection}
                isProcessing={processingItemId === item.id}
              />
            ))}
          </div>
        ) : (
          <div className="articles-list">
            {filteredItems.map((item) => (
              <LibraryItemRow
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                isMultiSelectMode={isMultiSelectMode}
                onRead={handleRead}
                onAction={handleCardAction}
                onToggleSelect={toggleItemSelection}
                isProcessing={processingItemId === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default LibraryPage
