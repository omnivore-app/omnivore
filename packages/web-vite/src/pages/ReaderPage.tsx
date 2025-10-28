// Reader page component for Omnivore Vite migration
// Displays article content with sanitized HTML

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DOMPurify from 'dompurify'
import {
  useLibraryItem,
  useUpdateReadingProgress,
  useSetLibraryItemLabels,
  useLabels,
} from '../lib/graphql-client'
import LabelPickerModal from '../components/LabelPickerModal'
import EditInfoModal from '../components/EditInfoModal'
import type { Label } from '../types/api'
import '../styles/ReaderPage.css'

const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    data: item,
    loading,
    error,
    fetchLibraryItem,
  } = useLibraryItem(id || '')
  const { updateProgress } = useUpdateReadingProgress()
  const { setLibraryItemLabels } = useSetLibraryItemLabels()
  const { data: allLabels, fetchLabels } = useLabels()
  const [lastSavedPercent, setLastSavedPercent] = useState(0)
  const [showLabelModal, setShowLabelModal] = useState(false)
  const [showEditInfoModal, setShowEditInfoModal] = useState(false)
  const [itemLabels, setItemLabels] = useState<Label[]>([])
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (id) {
      fetchLibraryItem()
    }
  }, [id, fetchLibraryItem])

  // Fetch all labels on mount
  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  // Update local labels when item loads
  useEffect(() => {
    if (item?.labels) {
      setItemLabels(item.labels)
    }
  }, [item])

  // Scroll tracking for reading progress
  useEffect(() => {
    if (!id || !item || item.state === 'CONTENT_NOT_FETCHED' || !item.content) {
      return
    }

    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Debounce: Update progress 1 second after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        const scrollTop = window.scrollY
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight

        // Calculate scroll percentage (0-100)
        const scrollPercent =
          docHeight > 0
            ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
            : 0

        // Only update if changed by at least 5%
        if (Math.abs(scrollPercent - lastSavedPercent) >= 5) {
          updateProgress(id, {
            readingProgressTopPercent: Math.round(scrollPercent),
            readingProgressBottomPercent: Math.round(scrollPercent),
          })
          setLastSavedPercent(scrollPercent)
        }
      }, 1000)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [id, item, lastSavedPercent, updateProgress])

  const handleBack = () => {
    navigate('/home')
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleLabelsUpdate = async (newLabelNames: string[]) => {
    console.log('[ReaderPage] handleLabelsUpdate called with:', newLabelNames)

    // NOTE: The LabelPickerModal has already called setLibraryItemLabels() successfully
    // We just need to update the local UI state and refetch to get the latest data

    setShowLabelModal(false)

    // Refetch both labels and the item to ensure we have the latest data
    await fetchLabels()
    await fetchLibraryItem()

    console.log('[ReaderPage] Refetched item after label update')
  }

  const handleInfoUpdate = async () => {
    // Refetch item to get updated info from server
    await fetchLibraryItem()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // 'l' key to open labels modal
      if (e.key === 'l' && !showLabelModal && !showEditInfoModal) {
        e.preventDefault()
        setShowLabelModal(true)
      }

      // 'e' key to open edit info modal
      if (e.key === 'e' && !showEditInfoModal && !showLabelModal) {
        e.preventDefault()
        setShowEditInfoModal(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showLabelModal, showEditInfoModal])

  // Loading state
  if (loading) {
    return (
      <div className="reader-page">
        <div className="reader-loading">
          <div className="spinner"></div>
          <p>Loading article...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="reader-page">
        <div className="reader-error">
          <h2>Error Loading Article</h2>
          <p>{error.message}</p>
          <button onClick={handleBack} className="back-button">
            ← Back to Library
          </button>
        </div>
      </div>
    )
  }

  // Not found state
  if (!item) {
    return (
      <div className="reader-page">
        <div className="reader-error">
          <h2>Article Not Found</h2>
          <p>
            The article you're looking for doesn't exist or has been deleted.
          </p>
          <button onClick={handleBack} className="back-button">
            ← Back to Library
          </button>
        </div>
      </div>
    )
  }

  // Content not fetched state
  if (item.state === 'CONTENT_NOT_FETCHED' || !item.content) {
    return (
      <div className="reader-page">
        <div className="reader-header">
          <button onClick={handleBack} className="back-button">
            ← Back to Library
          </button>
          <h1>{item.title}</h1>
          {item.author && <p className="author">By {item.author}</p>}
          {item.publishedAt && (
            <p className="publish-date">{formatDate(item.publishedAt)}</p>
          )}
          {item.originalUrl && (
            <a
              href={item.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="original-link"
            >
              View Original →
            </a>
          )}
        </div>
        <div className="reader-content-empty">
          <div className="empty-state">
            <h2>Content Not Available</h2>
            <p>
              This article's content is being processed. Please check back in a
              moment.
            </p>
            <p className="state-info">Status: {item.state}</p>
            <a
              href={item.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="view-original-button"
            >
              View Original Article
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(item.content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  })

  // Get user labels (non-internal) - use local state for optimistic updates
  const userLabels = itemLabels.filter((label) => !label.internal)

  return (
    <div className="reader-page">
      <div className="reader-header">
        <button onClick={handleBack} className="back-button">
          ← Back to Library
        </button>
        <h1>{item.title}</h1>
        {item.author && <p className="author">By {item.author}</p>}
        {item.publishedAt && (
          <p className="publish-date">{formatDate(item.publishedAt)}</p>
        )}

        {/* Labels display - read-only chips */}
        {userLabels.length > 0 && (
          <div className="reader-labels">
            {userLabels.map((label) => (
              <span
                key={label.id}
                className="reader-label-chip"
                style={{ backgroundColor: label.color }}
              >
                <svg
                  aria-hidden="true"
                  className="label-chip-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="none"
                >
                  <circle cx="12" cy="12" r="12" />
                </svg>
                {label.name}
              </span>
            ))}
          </div>
        )}

        {item.originalUrl && (
          <a
            href={item.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="original-link"
          >
            View Original →
          </a>
        )}

        {/* Toolbar with label edit button */}
        <div className="reader-toolbar">
          <button
            className="toolbar-button"
            onClick={() => setShowLabelModal(true)}
            title="Edit labels (l)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span>Labels</span>
          </button>
          <button
            className="toolbar-button"
            onClick={() => setShowEditInfoModal(true)}
            title="Edit info (e)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit Info</span>
          </button>
        </div>
      </div>

      <div
        className="reader-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* Label picker modal */}
      {showLabelModal && item && (
        <LabelPickerModal
          itemId={item.id}
          currentLabels={itemLabels.map((l) => l.name)}
          onUpdate={handleLabelsUpdate}
          onClose={() => setShowLabelModal(false)}
        />
      )}

      {/* Edit info modal */}
      {showEditInfoModal && item && (
        <EditInfoModal
          itemId={item.id}
          currentTitle={item.title}
          currentAuthor={item.author}
          currentDescription={item.description}
          onUpdate={handleInfoUpdate}
          onClose={() => setShowEditInfoModal(false)}
        />
      )}
    </div>
  )
}

export default ReaderPage
