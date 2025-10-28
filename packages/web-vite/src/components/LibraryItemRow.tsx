// Library item row component for list view
// Horizontal layout matching legacy Omnivore UI

import React, { useState, useRef, useEffect } from 'react'
import type { LibraryItem } from '../types/api'
import type { CardAction } from './LibraryItemCard'
import {
  calculateReadingTime,
  formatTimestamp,
  getProgressColor
} from '../lib/reading-time'
import '../styles/LibraryList.css'

interface LibraryItemRowProps {
  item: LibraryItem
  isSelected?: boolean
  isMultiSelectMode?: boolean
  onRead: (itemId: string) => void
  onAction: (action: CardAction, itemId: string) => void
  onToggleSelect?: (itemId: string) => void
  isProcessing?: boolean
}

const LibraryItemRow: React.FC<LibraryItemRowProps> = ({
  item,
  isSelected = false,
  isMultiSelectMode = false,
  onRead,
  onAction,
  onToggleSelect,
  isProcessing = false
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showAllLabels, setShowAllLabels] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const readingTime = calculateReadingTime(item.wordCount)
  const timestamp = formatTimestamp(item.savedAt)
  const progressPercent = item.readingProgressTopPercent ?? 0
  const progressColor = getProgressColor(progressPercent)

  // Determine thumbnail/icon source
  const thumbnailSrc = item.thumbnail || item.siteIcon
  const showSiteIcon = !item.thumbnail && item.siteIcon

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleMenuAction = (action: CardAction) => {
    setShowMenu(false)
    onAction(action, item.id)
  }

  const isArchived = item.folder === 'archive' || item.state === 'ARCHIVED'
  const isRead = item.readAt !== null && item.readAt !== undefined

  return (
    <div
      className={`library-item-row ${isSelected ? 'selected' : ''} ${showMenu ? 'menu-open' : ''}`}
    >
      {/* Checkbox */}
      {isMultiSelectMode && onToggleSelect && (
        <div className="row-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="checkbox-input"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Thumbnail/Icon */}
      <div className="row-thumbnail" onClick={() => onRead(item.id)}>
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt=""
            className={showSiteIcon ? 'site-icon-img' : 'thumbnail-img'}
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder on error
              const parent = e.currentTarget.parentElement
              if (parent) {
                parent.innerHTML = '<div class="thumbnail-placeholder-small">📄</div>'
              }
            }}
          />
        ) : (
          <div className="thumbnail-placeholder-small">
            {item.itemType === 'FILE' ? '📎' : '📄'}
          </div>
        )}
      </div>

      {/* Content column */}
      <div className="row-content" onClick={() => onRead(item.id)}>
        {/* Title */}
        <h3 className="row-title" title={item.title}>
          {item.title}
        </h3>

        {/* Metadata line */}
        <div className="row-metadata">
          {/* Site name */}
          {item.siteName && (
            <>
              <span className="metadata-item site-name-text">
                {item.siteName}
              </span>
              <span className="metadata-separator">•</span>
            </>
          )}

          {/* Timestamp */}
          <span className="metadata-item timestamp-text">
            {timestamp}
          </span>

          {/* Reading time */}
          {readingTime && (
            <>
              <span className="metadata-separator">•</span>
              <span className="metadata-item reading-time-text">
                {readingTime}
              </span>
            </>
          )}
        </div>

        {/* Progress bar */}
        {progressPercent > 0 && (
          <div className="row-progress">
            <div className="progress-bar-container-small">
              <div
                className="progress-bar-fill-small"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: progressColor
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Labels column */}
      <div className="row-labels">
        {item.labels && item.labels.length > 0 && (
          <div className="labels-list">
            {(showAllLabels ? item.labels : item.labels.slice(0, 2)).map((label) => (
              <span
                key={label.id}
                className="label-badge-small"
                style={{ backgroundColor: label.color }}
                title={label.description || label.name}
              >
                {label.name}
              </span>
            ))}
            {item.labels.length > 2 && (
              <span
                className="label-badge-small label-more-small"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAllLabels(!showAllLabels)
                }}
                style={{ cursor: 'pointer' }}
                title={showAllLabels ? 'Show less' : 'Show all labels'}
              >
                {showAllLabels ? '−' : `+${item.labels.length - 2}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Three-dot menu button */}
      <button
        className="row-menu-button"
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        disabled={isProcessing}
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <div ref={menuRef} className="row-menu-dropdown" onClick={(e) => e.stopPropagation()}>
          <button className="card-menu-item" onClick={() => handleMenuAction('set-labels')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span>Set Labels</span>
          </button>

          <button className="card-menu-item" onClick={() => handleMenuAction(isRead ? 'mark-unread' : 'mark-read')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isRead ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </>
              )}
            </svg>
            <span>{isRead ? 'Mark as Unread' : 'Mark as Read'}</span>
          </button>

          <button className="card-menu-item" onClick={() => handleMenuAction(isArchived ? 'unarchive' : 'archive')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8v13H3V8"></path>
              <path d="M1 3h22v5H1z"></path>
              <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
            <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
          </button>

          <button className="card-menu-item" onClick={() => handleMenuAction('open-notebook')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span>Open Notebook</span>
          </button>

          <button className="card-menu-item" onClick={() => handleMenuAction('open-original')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Open Original</span>
          </button>

          <button className="card-menu-item" onClick={() => handleMenuAction('edit-info')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit Info</span>
          </button>

          <div className="card-menu-divider"></div>

          <button className="card-menu-item card-menu-item-danger" onClick={() => handleMenuAction('delete')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default LibraryItemRow
