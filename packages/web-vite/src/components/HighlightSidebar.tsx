// Highlight Sidebar Component - Shows all highlights for an article
// Allows editing, deleting, and navigating to highlights

import '../styles/HighlightSidebar.css'

import React, { useState } from 'react'

import type { Highlight } from '../lib/graphql-client'
import type { HighlightColor } from '../types/api'

interface HighlightSidebarProps {
  highlights: Highlight[]
  onUpdateHighlight: (
    id: string,
    annotation: string,
    color: HighlightColor,
  ) => Promise<void>
  onDeleteHighlight: (id: string) => Promise<void>
  onJumpToHighlight: (id: string) => void
  onClose: () => void
}

const HighlightSidebar: React.FC<HighlightSidebarProps> = ({
  highlights,
  onUpdateHighlight,
  onDeleteHighlight,
  onJumpToHighlight,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAnnotation, setEditAnnotation] = useState('')
  const [editColor, setEditColor] = useState<HighlightColor>('YELLOW')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sortedHighlights = [...highlights].sort(
    (a, b) => a.highlightPositionPercent - b.highlightPositionPercent,
  )

  const colorOptions: Array<{
    value: HighlightColor
    label: string
    bg: string
  }> = [
    { value: 'YELLOW', label: 'General', bg: 'rgba(255, 212, 59, 0.5)' },
    { value: 'RED', label: 'Important', bg: 'rgba(255, 107, 107, 0.5)' },
    { value: 'GREEN', label: 'Action', bg: 'rgba(85, 239, 196, 0.5)' },
    { value: 'BLUE', label: 'Reference', bg: 'rgba(116, 185, 255, 0.5)' },
  ]

  const startEdit = (highlight: Highlight) => {
    setEditingId(highlight.id)
    setEditAnnotation(highlight.annotation || '')
    setEditColor(highlight.color)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditAnnotation('')
  }

  const saveEdit = async (id: string) => {
    await onUpdateHighlight(id, editAnnotation, editColor)
    setEditingId(null)
  }

  const confirmDelete = (id: string) => {
    setDeletingId(id)
  }

  const handleDelete = async (id: string) => {
    await onDeleteHighlight(id)
    setDeletingId(null)
  }

  if (highlights.length === 0) {
    return (
      <div className="highlight-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Highlights</h2>
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>
        <div className="sidebar-empty">
          <p>No highlights yet</p>
          <p className="empty-hint">Select text to create a highlight</p>
        </div>
      </div>
    )
  }

  return (
    <div className="highlight-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          Highlights{' '}
          <span className="highlight-count">({highlights.length})</span>
        </h2>
        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <div className="sidebar-content">
        {sortedHighlights.map((highlight) => (
          <div
            key={highlight.id}
            className={`highlight-item highlight-item-${highlight.color}`}
          >
            {/* Color indicator bar */}
            <div
              className={`highlight-color-bar highlight-bar-${highlight.color}`}
            />

            <div className="highlight-body">
              {/* Quote */}
              <button
                type="button"
                className="highlight-quote"
                onClick={() => onJumpToHighlight(highlight.id)}
              >
                "{highlight.quote}"
              </button>

              {/* Annotation - editable or display */}
              {editingId === highlight.id ? (
                <div className="edit-container">
                  <textarea
                    className="edit-annotation"
                    value={editAnnotation}
                    onChange={(e) => setEditAnnotation(e.target.value)}
                    placeholder="Add your thoughts..."
                    rows={3}
                    autoFocus
                  />
                  <div className="edit-color-picker">
                    <label className="edit-label">Color:</label>
                    <div className="color-options">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`color-option ${
                            editColor === option.value ? 'active' : ''
                          }`}
                          style={{ backgroundColor: option.bg }}
                          onClick={() => setEditColor(option.value)}
                          title={option.label}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button
                      type="button"
                      className="btn-save"
                      onClick={() => saveEdit(highlight.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {highlight.annotation && (
                    <div className="highlight-annotation">
                      {highlight.annotation}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="highlight-actions">
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => startEdit(highlight)}
                      title="Edit"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="action-btn action-btn-danger"
                      onClick={() => confirmDelete(highlight.id)}
                      title="Delete"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </>
              )}

              {/* Delete confirmation */}
              {deletingId === highlight.id && (
                <div className="delete-confirmation">
                  <p>Delete this highlight?</p>
                  <div className="delete-actions">
                    <button
                      type="button"
                      className="btn-delete-confirm"
                      onClick={() => handleDelete(highlight.id)}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="btn-delete-cancel"
                      onClick={() => setDeletingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HighlightSidebar
