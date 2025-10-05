// Library page component for Omnivore Vite migration
// Uses the new NestJS GraphQL endpoint to fetch the user's library items

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import {
  graphqlRequest,
  useArchiveItem,
  useDeleteItem,
  useBulkArchive,
  useBulkDelete,
  useBulkMoveToFolder,
  useBulkMarkAsRead,
  useLabels,
} from '../lib/graphql-client'
import type {
  LibraryItem as LibraryItemType,
  LibraryItemsConnection,
  LibraryItemState,
} from '../types/api'
import ErrorBoundary from '../components/ErrorBoundary'
import LabelPicker from '../components/LabelPicker'
import AddLinkModal from '../components/AddLinkModal'
import '../styles/LabelPicker.css'

const LIBRARY_ITEMS_QUERY = `
  query LibraryItems($first: Int!, $after: String, $search: LibrarySearchInput) {
    libraryItems(first: $first, after: $after, search: $search) {
      items {
        id
        title
        slug
        originalUrl
        author
        description
        savedAt
        createdAt
        updatedAt
        publishedAt
        readAt
        state
        contentReader
        folder
        labels {
          id
          name
          color
          description
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
  const [activeFolder, setActiveFolder] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('SAVED_AT')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [processingItemId, setProcessingItemId] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedLabelFilters, setSelectedLabelFilters] = useState<string[]>([])
  const [showLabelFilter, setShowLabelFilter] = useState(false)
  const [showAddLinkModal, setShowAddLinkModal] = useState(false)

  const { archiveItem } = useArchiveItem()
  const { deleteItem } = useDeleteItem()
  const { bulkArchive } = useBulkArchive()
  const { bulkDelete } = useBulkDelete()
  const { bulkMoveToFolder } = useBulkMoveToFolder()
  const { bulkMarkAsRead } = useBulkMarkAsRead()
  const { data: allLabels, fetchLabels } = useLabels()

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

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
        const searchParams: any = {}
        if (searchQuery.trim()) {
          searchParams.query = searchQuery.trim()
        }
        if (activeFolder && activeFolder !== 'all') {
          searchParams.folder = activeFolder
        }
        if (selectedLabelFilters.length > 0) {
          searchParams.labels = selectedLabelFilters
        }
        searchParams.sortBy = sortBy
        searchParams.sortOrder = sortOrder

        const data = await graphqlRequest<{ libraryItems: LibraryItemsConnection }>(
          LIBRARY_ITEMS_QUERY,
          {
            first: INITIAL_PAGE_SIZE,
            search: Object.keys(searchParams).length > 0 ? searchParams : undefined
          }
        )

        setItems(data.libraryItems.items)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load your library'
        )
      } finally {
        setLoading(false)
        setSearching(false)
      }
    }

    // Debounce search query - shorter for better UX
    const debounceTimer = setTimeout(fetchItems, searchQuery ? 300 : 0)
    return () => clearTimeout(debounceTimer)
  }, [user, searchQuery, activeFolder, sortBy, sortOrder, selectedLabelFilters])

  // No client-side filtering needed - using server-side search
  const filteredItems = items

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRead = (itemId: string) => {
    navigate(`/reader/${itemId}`)
  }

  const handleArchive = async (itemId: string, currentState: LibraryItemState) => {
    const isArchived = currentState === 'ARCHIVED'

    try {
      setProcessingItemId(itemId)

      // Optimistic update
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, state: isArchived ? 'SUCCEEDED' : 'ARCHIVED', folder: isArchived ? 'inbox' : 'archive' }
            : item
        )
      )

      await archiveItem(itemId, !isArchived)
      showToast(isArchived ? 'Item unarchived' : 'Item archived', 'success')
    } catch (err) {
      // Revert optimistic update on error
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, state: currentState }
            : item
        )
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
            ? { ...item, state: archived ? 'ARCHIVED' : 'SUCCEEDED', folder: archived ? 'archive' : 'inbox' }
            : item
        )
      )

      const result = await bulkArchive(itemIds, archived)
      showToast(result.message || `${result.successCount} items ${archived ? 'archived' : 'unarchived'}`, 'success')

      if (result.failureCount > 0 && result.errors) {
        console.error('Bulk archive errors:', result.errors)
      }

      deselectAll()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Bulk archive failed', 'error')
      // Refetch to restore correct state
      window.location.reload()
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) {
      return
    }

    try {
      const itemIds = Array.from(selectedItems)

      // Optimistic update - remove from list
      setItems((prevItems) => prevItems.filter((item) => !selectedItems.has(item.id)))

      const result = await bulkDelete(itemIds)
      showToast(result.message || `${result.successCount} items deleted`, 'success')

      if (result.failureCount > 0 && result.errors) {
        console.error('Bulk delete errors:', result.errors)
      }

      deselectAll()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Bulk delete failed', 'error')
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
            : item
        )
      )

      const result = await bulkMoveToFolder(itemIds, folder)
      showToast(result.message || `${result.successCount} items moved to ${folder}`, 'success')

      if (result.failureCount > 0 && result.errors) {
        console.error('Bulk move errors:', result.errors)
      }

      deselectAll()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Bulk move failed', 'error')
      window.location.reload()
    }
  }

  const handleBulkMarkAsReadAction = async () => {
    if (selectedItems.size === 0) return

    try {
      const itemIds = Array.from(selectedItems)

      // Optimistic update
      setItems((prevItems) =>
        prevItems.map((item) =>
          selectedItems.has(item.id)
            ? { ...item, readAt: new Date().toISOString() }
            : item
        )
      )

      const result = await bulkMarkAsRead(itemIds)
      showToast(result.message || `${result.successCount} items marked as read`, 'success')

      if (result.failureCount > 0 && result.errors) {
        console.error('Bulk mark as read errors:', result.errors)
      }

      deselectAll()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Bulk mark as read failed', 'error')
      window.location.reload()
    }
  }

  const handleLabelsUpdate = async (itemId: string, newLabelNames: string[]) => {
    // Optimistic update - convert label names to Label objects
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId && allLabels) {
          // Map label names to full Label objects from allLabels
          const updatedLabels = newLabelNames
            .map(name => allLabels.find(l => l.name === name))
            .filter((l): l is NonNullable<typeof l> => l !== undefined)
          return { ...item, labels: updatedLabels }
        }
        return item
      })
    )
    showToast('Labels updated', 'success')

    // Refetch library items to get the actual updated data from server
    // This ensures the labels are persisted and the filter will work correctly
    try {
      const searchParams: any = {}
      if (searchQuery.trim()) {
        searchParams.query = searchQuery.trim()
      }
      if (activeFolder && activeFolder !== 'all') {
        searchParams.folder = activeFolder
      }
      if (selectedLabelFilters.length > 0) {
        searchParams.labels = selectedLabelFilters
      }
      searchParams.sortBy = sortBy
      searchParams.sortOrder = sortOrder

      const data = await graphqlRequest<{ libraryItems: LibraryItemsConnection }>(
        LIBRARY_ITEMS_QUERY,
        {
          first: INITIAL_PAGE_SIZE,
          search: Object.keys(searchParams).length > 0 ? searchParams : undefined
        }
      )

      setItems(data.libraryItems.items)
    } catch (err) {
      console.error('Failed to refetch library items:', err)
      // Don't show error toast here since the optimistic update already succeeded
    }
  }

  const toggleLabelFilter = (labelName: string) => {
    setSelectedLabelFilters((prev) => {
      if (prev.includes(labelName)) {
        return prev.filter((l) => l !== labelName)
      } else {
        return [...prev, labelName]
      }
    })
  }

  const clearLabelFilters = () => {
    setSelectedLabelFilters([])
  }

  const handleAddLinkSuccess = async () => {
    showToast('Link added successfully!', 'success')
    // Refetch library items
    try {
      const searchParams: any = {}
      if (searchQuery.trim()) {
        searchParams.query = searchQuery.trim()
      }
      if (activeFolder && activeFolder !== 'all') {
        searchParams.folder = activeFolder
      }
      if (selectedLabelFilters.length > 0) {
        searchParams.labels = selectedLabelFilters
      }
      searchParams.sortBy = sortBy
      searchParams.sortOrder = sortOrder

      const data = await graphqlRequest<{ libraryItems: LibraryItemsConnection }>(
        LIBRARY_ITEMS_QUERY,
        {
          first: INITIAL_PAGE_SIZE,
          search: Object.keys(searchParams).length > 0 ? searchParams : undefined
        }
      )

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
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
      <div className="library-page">
        <div className="library-header">
          <h1>
            Your Library {searching && <span className="searching-indicator">Searching...</span>}
            {selectedItems.size > 0 && (
              <span className="selection-count">({selectedItems.size} selected)</span>
            )}
          </h1>
          <div className="library-controls">
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
            <div className="label-filter-wrapper">
              <button
                className="label-filter-toggle-btn"
                onClick={() => setShowLabelFilter(!showLabelFilter)}
              >
                🏷️ Filter by Labels {selectedLabelFilters.length > 0 && `(${selectedLabelFilters.length})`}
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
              className="multi-select-toggle-btn"
              onClick={() => {
                setIsMultiSelectMode(!isMultiSelectMode)
                if (isMultiSelectMode) {
                  deselectAll()
                }
              }}
            >
              {isMultiSelectMode ? 'Exit Multi-Select' : 'Multi-Select'}
            </button>
            <button
              className="add-article-btn"
              onClick={() => setShowAddLinkModal(true)}
            >
              + Add Article
            </button>
          </div>
        </div>

        <AddLinkModal
          isOpen={showAddLinkModal}
          onClose={() => setShowAddLinkModal(false)}
          onSuccess={handleAddLinkSuccess}
        />

        {isMultiSelectMode && (
          <div className="bulk-actions-bar">
            <div className="bulk-select-controls">
              <button onClick={selectAll} className="bulk-control-btn">
                Select All
              </button>
              <button onClick={deselectAll} className="bulk-control-btn">
                Deselect All
              </button>
              <span className="selected-count">
                {selectedItems.size} of {items.length} selected
              </span>
            </div>
            {selectedItems.size > 0 && (
              <div className="bulk-action-buttons">
                <button
                  onClick={() => handleBulkArchive(true)}
                  className="bulk-action-btn"
                >
                  Archive Selected
                </button>
                <button
                  onClick={() => handleBulkArchive(false)}
                  className="bulk-action-btn"
                >
                  Unarchive Selected
                </button>
                <button
                  onClick={() => handleBulkMoveToFolderAction('inbox')}
                  className="bulk-action-btn"
                >
                  Move to Inbox
                </button>
                <button
                  onClick={() => handleBulkMoveToFolderAction('archive')}
                  className="bulk-action-btn"
                >
                  Move to Archive
                </button>
                <button
                  onClick={handleBulkMarkAsReadAction}
                  className="bulk-action-btn"
                >
                  Mark as Read
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bulk-action-btn bulk-action-btn-danger"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        )}

        <div className="library-filters">
          <div className="folder-tabs">
            <button
              className={`folder-tab ${activeFolder === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFolder('all')}
            >
              All
            </button>
            <button
              className={`folder-tab ${activeFolder === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveFolder('inbox')}
            >
              Inbox
            </button>
            <button
              className={`folder-tab ${activeFolder === 'archive' ? 'active' : ''}`}
              onClick={() => setActiveFolder('archive')}
            >
              Archive
            </button>
            <button
              className={`folder-tab ${activeFolder === 'trash' ? 'active' : ''}`}
              onClick={() => setActiveFolder('trash')}
            >
              Trash
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="SAVED_AT">Date Saved</option>
              <option value="UPDATED_AT">Last Updated</option>
              <option value="PUBLISHED_AT">Published Date</option>
              <option value="TITLE">Title</option>
              <option value="AUTHOR">Author</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
              title={sortOrder === 'DESC' ? 'Descending' : 'Ascending'}
            >
              {sortOrder === 'DESC' ? '↓' : '↑'}
            </button>
          </div>
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
                className="add-article-btn"
                onClick={() => setShowAddLinkModal(true)}
              >
                + Add Your First Article
              </button>
            )}
          </div>
        ) : (
          <div className="articles-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`article-card ${selectedItems.has(item.id) ? 'selected' : ''}`}
              >
                {isMultiSelectMode && (
                  <div className="article-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="checkbox-input"
                    />
                  </div>
                )}
                <div className="article-header">
                  <div className="article-state">
                    <span
                      className="state-indicator"
                      style={{ backgroundColor: getStateColor(item.state) }}
                    ></span>
                    <span className="state-label">
                      {getStateLabel(item.state)}
                    </span>
                  </div>
                  <div className="article-date">{formatDate(item.savedAt)}</div>
                </div>

                <h3 className="article-title">
                  <button
                    onClick={() => handleRead(item.id)}
                    className="article-title-btn"
                  >
                    {item.title}
                  </button>
                </h3>

                <div className="article-meta">
                  <span className="article-url">{item.originalUrl}</span>
                </div>

                {item.labels && item.labels.length > 0 && (
                  <div className="article-labels">
                    {item.labels.map((label) => (
                      <span
                        key={label.id}
                        className="label"
                        style={{
                          backgroundColor: label.color,
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          marginRight: '0.25rem'
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="article-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleRead(item.id)}
                    disabled={processingItemId === item.id}
                  >
                    Read
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleArchive(item.id, item.state)}
                    disabled={processingItemId === item.id}
                  >
                    {item.state === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
                  </button>
                  <LabelPicker
                    itemId={item.id}
                    currentLabels={item.labels?.map(l => l.name) || []}
                    onUpdate={(labelNames) => handleLabelsUpdate(item.id, labelNames)}
                  />
                  <button
                    className="action-btn action-btn-danger"
                    onClick={() => handleDelete(item.id)}
                    disabled={processingItemId === item.id}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default LibraryPage
