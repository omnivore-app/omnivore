// Notebook Modal Component - Markdown-based note taking for articles
// Allows users to write notes about articles they're reading

import '../styles/NotebookModal.css'

import React, { useEffect, useRef, useState } from 'react'

import { renderMarkdown } from '../lib/markdown'

interface NotebookModalProps {
  itemTitle: string
  currentNote?: string | null
  onSave: (note: string) => Promise<void>
  onClose: () => void
}

const NotebookModal: React.FC<NotebookModalProps> = ({
  itemTitle,
  currentNote,
  onSave,
  onClose,
}) => {
  const [note, setNote] = useState(currentNote || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Track changes
  useEffect(() => {
    setHasChanges(note !== (currentNote || ''))
  }, [note, currentNote])

  // Auto-focus textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      // Place cursor at end
      textareaRef.current.selectionStart = note.length
      textareaRef.current.selectionEnd = note.length
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges) {
          handleSave()
        }
      }
      // Escape to close (with confirmation if there are unsaved changes)
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges, note])

  const handleSave = async () => {
    if (saving) return

    setSaving(true)
    setSaved(false)

    try {
      await onSave(note)
      setSaved(true)
      setHasChanges(false)

      // Clear "saved" indicator after 2 seconds
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save notebook:', error)
      alert('Failed to save notebook. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      )
      if (!confirmed) return
    }
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const wordCount = note.trim().split(/\s+/).filter(Boolean).length
  const charCount = note.length

  return (
    <div className="notebook-modal-backdrop" onClick={handleBackdropClick}>
      <div className="notebook-modal">
        {/* Header */}
        <div className="notebook-header">
          <div className="notebook-title-section">
            <h2 className="notebook-title">Notebook</h2>
            <p className="notebook-article-title" title={itemTitle}>
              {itemTitle}
            </p>
          </div>
          <button
            type="button"
            className="notebook-close"
            onClick={handleClose}
            aria-label="Close notebook"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="notebook-tabs">
          <button
            type="button"
            className={`notebook-tab ${viewMode === 'edit' ? 'active' : ''}`}
            onClick={() => setViewMode('edit')}
          >
            Edit
          </button>
          <button
            type="button"
            className={`notebook-tab ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            Preview
          </button>
        </div>

        {/* Editor / Preview */}
        <div className="notebook-editor">
          {viewMode === 'edit' ? (
            <textarea
              ref={textareaRef}
              className="notebook-textarea"
              placeholder="Write your notes here... Markdown supported."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              spellCheck
            />
          ) : (
            <div
              className="notebook-preview"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(note) }}
            />
          )}
        </div>

        {/* Footer with stats and actions */}
        <div className="notebook-footer">
          <div className="notebook-stats">
            <span className="notebook-stat">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
            <span className="notebook-stat-separator">•</span>
            <span className="notebook-stat">
              {charCount} {charCount === 1 ? 'character' : 'characters'}
            </span>
            {hasChanges && (
              <>
                <span className="notebook-stat-separator">•</span>
                <span className="notebook-unsaved">Unsaved changes</span>
              </>
            )}
            {saved && (
              <>
                <span className="notebook-stat-separator">•</span>
                <span className="notebook-saved">Saved!</span>
              </>
            )}
          </div>

          <div className="notebook-actions">
            <button
              type="button"
              className="notebook-btn notebook-btn-secondary"
              onClick={handleClose}
            >
              {hasChanges ? 'Cancel' : 'Close'}
            </button>
            <button
              type="button"
              className="notebook-btn notebook-btn-primary"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Help text */}
        <div className="notebook-help">
          <span className="notebook-help-hint">
            💡 Tip: Use Markdown formatting. Press <kbd>⌘S</kbd> or{' '}
            <kbd>Ctrl+S</kbd> to save
          </span>
        </div>
      </div>
    </div>
  )
}

export default NotebookModal
