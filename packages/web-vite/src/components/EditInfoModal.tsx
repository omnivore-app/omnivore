import { useState, useEffect } from 'react'
import { useUpdateLibraryItem, type UpdateLibraryItemInput } from '../lib/graphql-client'
import '../styles/EditInfoModal.css'

interface EditInfoModalProps {
  itemId: string
  currentTitle: string
  currentAuthor?: string | null
  currentDescription?: string | null
  onUpdate: (data: UpdateLibraryItemInput) => void
  onClose: () => void
}

export function EditInfoModal({
  itemId,
  currentTitle,
  currentAuthor,
  currentDescription,
  onUpdate,
  onClose,
}: EditInfoModalProps) {
  const { updateLibraryItem, loading } = useUpdateLibraryItem()
  const [title, setTitle] = useState(currentTitle)
  const [author, setAuthor] = useState(currentAuthor || '')
  const [description, setDescription] = useState(currentDescription || '')
  const [error, setError] = useState<string | null>(null)

  // Update local state when props change
  useEffect(() => {
    setTitle(currentTitle)
    setAuthor(currentAuthor || '')
    setDescription(currentDescription || '')
  }, [currentTitle, currentAuthor, currentDescription])

  const handleSave = async () => {
    try {
      setError(null)
      const input: UpdateLibraryItemInput = {}

      // Only include fields that changed
      if (title !== currentTitle) input.title = title
      if (author !== (currentAuthor || '')) input.author = author
      if (description !== (currentDescription || '')) input.description = description

      // If nothing changed, just close
      if (Object.keys(input).length === 0) {
        onClose()
        return
      }

      await updateLibraryItem(itemId, input)
      onUpdate(input)
      onClose()
    } catch (err) {
      console.error('Failed to update item:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item info'
      setError(errorMessage)
    }
  }

  const handleCancel = () => {
    setTitle(currentTitle)
    setAuthor(currentAuthor || '')
    setDescription(currentDescription || '')
    onClose()
  }

  return (
    <div className="edit-info-modal-overlay" onClick={onClose}>
      <div className="edit-info-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-info-modal-header">
          <h2 className="edit-info-modal-title">Edit Info</h2>
          <button className="edit-info-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="edit-info-modal-body">
          {/* Error message */}
          {error && (
            <div className="edit-info-error">
              {error}
            </div>
          )}

          {/* Title Field */}
          <div className="edit-info-field">
            <label htmlFor="edit-title" className="edit-info-label">
              Title <span className="required">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              className="edit-info-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="Enter article title..."
            />
          </div>

          {/* Author Field */}
          <div className="edit-info-field">
            <label htmlFor="edit-author" className="edit-info-label">
              Author
            </label>
            <input
              id="edit-author"
              type="text"
              className="edit-info-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={loading}
              placeholder="Enter author name..."
            />
          </div>

          {/* Description Field */}
          <div className="edit-info-field">
            <label htmlFor="edit-description" className="edit-info-label">
              Description
            </label>
            <textarea
              id="edit-description"
              className="edit-info-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Enter a brief description..."
            />
          </div>
        </div>

        <div className="edit-info-modal-footer">
          <button
            type="button"
            className="edit-info-modal-btn edit-info-modal-btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="edit-info-modal-btn edit-info-modal-btn-save"
            onClick={handleSave}
            disabled={loading || !title.trim()}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditInfoModal
