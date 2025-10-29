// Enhanced library item card component for grid view
// Features: thumbnail, reading time, progress bar, site attribution

import React from 'react'
import type { LibraryItem, Label } from '../types/api'
import {
  calculateReadingTime,
  formatTimestamp,
  getProgressColor,
  formatReadingProgress
} from '../lib/reading-time'
import LabelPicker from './LabelPicker'
import FlairBadge from './FlairBadge'
import CardSkeleton from './CardSkeleton'
import '../styles/LibraryCard.css'

export type CardDensity = 'compact' | 'comfortable' | 'spacious'

export type CardAction =
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'set-labels'
  | 'open-notebook'
  | 'open-original'
  | 'edit-info'
  | 'mark-read'
  | 'mark-unread'

interface LibraryItemCardProps {
  item: LibraryItem
  isSelected?: boolean
  isMultiSelectMode?: boolean
  onRead: (itemId: string) => void
  onAction: (action: CardAction, itemId: string) => void
  onToggleSelect?: (itemId: string) => void
  isProcessing?: boolean
  density?: CardDensity
}

const LibraryItemCard: React.FC<LibraryItemCardProps> = ({
  item,
  isSelected = false,
  isMultiSelectMode = false,
  onRead,
  onAction,
  onToggleSelect,
  isProcessing = false,
  density = 'comfortable'
}) => {
  const [showMenu, setShowMenu] = React.useState(false)
  const [showAllLabels, setShowAllLabels] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const readingTime = calculateReadingTime(item.wordCount)
  const timestamp = formatTimestamp(item.savedAt)
  const progressPercent = item.readingProgressTopPercent ?? 0
  const progressColor = getProgressColor(progressPercent)
  const progressLabel = formatReadingProgress(
    item.readingProgressTopPercent,
    item.readingProgressBottomPercent
  )

  // Close menu when clicking outside
  React.useEffect(() => {
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

  // Determine thumbnail source (thumbnail > siteIcon > placeholder)
  const thumbnailSrc = item.thumbnail || item.siteIcon || null
  const hasThumbnail = !!thumbnailSrc

  // Build class names based on density and state
  const cardClasses = [
    'library-item-card',
    `density-${density}`,
    isSelected ? 'selected' : '',
    item.state === 'ARCHIVED' ? 'is-archived' : '',
    isProcessing ? 'is-processing' : ''
  ].filter(Boolean).join(' ')

  // Density-specific behavior
  const showThumbnail = density !== 'compact'
  const showAuthor = density === 'spacious'

  // Separate system labels (Flair) from user labels (Tags)
  const flairLabels = item.labels?.filter(label => label.internal === true) || []
  const userTags = item.labels?.filter(label => !label.internal) || []

  // Show skeleton loader when processing
  if (item.state === 'PROCESSING') {
    return <CardSkeleton density={density} />
  }

  return (
    <div
      className={cardClasses}
      onClick={() => !isMultiSelectMode && onRead(item.id)}
      role="article"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && !isMultiSelectMode) {
          onRead(item.id)
        }
      }}
    >
      {/* Multi-select checkbox */}
      {isMultiSelectMode && onToggleSelect && (
        <div className="card-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="checkbox-input"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Thumbnail - Only show in comfortable/spacious modes */}
      {showThumbnail && (
        <div className="card-thumbnail">
          {hasThumbnail ? (
            <img
              src={thumbnailSrc}
              alt={item.title}
              className="thumbnail-image"
              loading="lazy"
              onError={(e) => {
                // Fallback to placeholder on image load error
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          {!hasThumbnail && (
            <div className="thumbnail-placeholder">
              <span className="placeholder-icon">📄</span>
            </div>
          )}
          {/* Content type indicator */}
          {item.itemType && item.itemType !== 'ARTICLE' && (
            <div className="content-type-badge">
              {item.itemType === 'FILE' ? '📎' : ''}
              {item.itemType === 'VIDEO' ? '🎥' : ''}
              {item.itemType === 'AUDIO' ? '🎧' : ''}
            </div>
          )}

          {/* Three-dot menu button - hidden in multi-select mode */}
          {!isMultiSelectMode && (
            <button
              className="card-menu-button"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              aria-label="Card actions"
              aria-expanded={showMenu}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Dropdown menu - positioned outside thumbnail to avoid overflow clipping */}
      {showMenu && !isMultiSelectMode && showThumbnail && (
        <div ref={menuRef} className="card-menu-dropdown" onClick={(e) => e.stopPropagation()}>
          <button
            className="card-menu-item"
            onClick={() => handleMenuAction(item.state === 'ARCHIVED' ? 'unarchive' : 'archive')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8"></polyline>
              <rect x="1" y="3" width="22" height="5"></rect>
              <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
            {item.state === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
          </button>

          <button
            className="card-menu-item"
            onClick={() => handleMenuAction('set-labels')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            Set Labels
          </button>

          <button
            className="card-menu-item"
            onClick={() => handleMenuAction('open-notebook')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Open Notebook
          </button>

          <button
            className="card-menu-item"
            onClick={() => handleMenuAction('open-original')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Open Original
          </button>

          <button
            className="card-menu-item"
            onClick={() => handleMenuAction('edit-info')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Info
          </button>

          <button
            className="card-menu-item"
            onClick={() => handleMenuAction(progressPercent > 0 ? 'mark-unread' : 'mark-read')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {progressPercent > 0 ? 'Mark Unread' : 'Mark Read'}
          </button>

          <div className="card-menu-divider"></div>

          <button
            className="card-menu-item card-menu-item-danger"
            onClick={() => handleMenuAction('delete')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      )}

      {/* Card content wrapper */}
      <div className="card-content">
        {/* Title */}
        <h3 className="card-title">
          <span className="card-title-text" title={item.title}>
            {item.title}
          </span>
        </h3>

        {/* Description */}
        {item.description && (
          <p className="card-description">
            {item.description}
          </p>
        )}

        {/* Metadata bar - Site name, Author, Reading time, Saved date */}
        <div className="card-metadata">
          {/* Site name/source with globe icon */}
          {item.siteName && (
            <div className="metadata-item">
              <svg className="metadata-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>{item.siteName}</span>
            </div>
          )}

          {/* Author name with user icon */}
          {item.author && (
            <div className="metadata-item">
              <svg className="metadata-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>{item.author}</span>
            </div>
          )}

          {/* Reading time with book-open icon */}
          {readingTime && (
            <div className="metadata-item">
              <svg className="metadata-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span>{readingTime}</span>
            </div>
          )}

          {/* Saved date with bookmark icon */}
          {timestamp && (
            <div className="metadata-item">
              <svg className="metadata-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
              </svg>
              <span>{timestamp}</span>
            </div>
          )}
        </div>

        {/* Tags (user labels) - minimalist chips with tag icon */}
        {userTags.length > 0 && (
          <div className="card-labels">
            {(showAllLabels ? userTags : userTags.slice(0, 3)).map((label) => (
              <span
                key={label.id}
                className="label-badge"
                title={label.description || label.name}
              >
                <svg className="label-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                {label.name}
              </span>
            ))}
            {userTags.length > 3 && (
              <span
                className="label-badge label-more"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAllLabels(!showAllLabels)
                }}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    setShowAllLabels(!showAllLabels)
                  }
                }}
                title={showAllLabels ? 'Show fewer labels' : `Show ${userTags.length - 3} more labels`}
              >
                {showAllLabels ? '− Show less' : `+${userTags.length - 3}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress bar at bottom of card */}
      {progressPercent > 0 && (
        <div className="card-progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: progressColor
            }}
          />
        </div>
      )}
    </div>
  )
}

export default LibraryItemCard
