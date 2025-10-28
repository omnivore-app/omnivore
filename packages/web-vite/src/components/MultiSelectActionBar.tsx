/**
 * MultiSelectActionBar - Floating action bar for batch operations
 *
 * Per ARC-009B Design System:
 * - Appears when items are selected in multi-select mode
 * - Shows count of selected items
 * - Provides batch actions (Archive, Delete, Add Labels, etc.)
 * - Mobile: Bottom floating bar
 * - Desktop: Top floating bar or bottom depending on UX preference
 *
 * Accessibility:
 * - Keyboard navigation support
 * - Clear action labels
 * - Escape key to exit multi-select mode
 */

import React, { useEffect } from 'react'
import '../styles/MultiSelectActionBar.css'

interface MultiSelectActionBarProps {
  selectedCount: number
  onArchive: () => void
  onDelete: () => void
  onAddLabels: () => void
  onClearSelection: () => void
  onExitMultiSelect: () => void
}

const MultiSelectActionBar: React.FC<MultiSelectActionBarProps> = ({
  selectedCount,
  onArchive,
  onDelete,
  onAddLabels,
  onClearSelection,
  onExitMultiSelect
}) => {
  // Handle Escape key to exit multi-select mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitMultiSelect()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onExitMultiSelect])

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="multi-select-action-bar" role="toolbar" aria-label="Batch actions">
      {/* Selection info */}
      <div className="action-bar-info">
        <span className="action-bar-count">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
        <button
          className="action-bar-btn action-bar-btn-link"
          onClick={onClearSelection}
          aria-label="Clear selection"
        >
          Clear
        </button>
      </div>

      {/* Actions */}
      <div className="action-bar-actions">
        <button
          className="action-bar-btn action-bar-btn-primary"
          onClick={onAddLabels}
          aria-label={`Add labels to ${selectedCount} items`}
          title="Add labels to selected items"
        >
          <span className="action-bar-icon">🏷️</span>
          <span className="action-bar-text">Add Labels</span>
        </button>

        <button
          className="action-bar-btn action-bar-btn-secondary"
          onClick={onArchive}
          aria-label={`Archive ${selectedCount} items`}
          title="Archive selected items"
        >
          <span className="action-bar-icon">📦</span>
          <span className="action-bar-text">Archive</span>
        </button>

        <button
          className="action-bar-btn action-bar-btn-danger"
          onClick={onDelete}
          aria-label={`Delete ${selectedCount} items`}
          title="Delete selected items"
        >
          <span className="action-bar-icon">🗑️</span>
          <span className="action-bar-text">Delete</span>
        </button>
      </div>

      {/* Exit button */}
      <button
        className="action-bar-btn action-bar-btn-close"
        onClick={onExitMultiSelect}
        aria-label="Exit multi-select mode"
        title="Exit multi-select mode (Esc)"
      >
        <span className="action-bar-icon">✕</span>
      </button>
    </div>
  )
}

export default MultiSelectActionBar
