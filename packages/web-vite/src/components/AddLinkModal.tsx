import React, { useState } from 'react'
import { useSaveUrl } from '../lib/graphql-client'
import '../styles/AddLinkModal.css'

interface AddLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type ContentType = 'link' | 'pdf' | 'rss'

const AddLinkModal: React.FC<AddLinkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [contentType, setContentType] = useState<ContentType>('link')
  const [url, setUrl] = useState('')
  const [folder, setFolder] = useState<'inbox' | 'archive'>('inbox')
  const [validationError, setValidationError] = useState<string | null>(null)
  const { saveUrl, loading, error } = useSaveUrl()

  const validateUrl = (urlString: string): boolean => {
    try {
      // Basic URL validation
      if (!urlString.trim()) {
        setValidationError('URL is required')
        return false
      }

      // Check if it's a valid URL format
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      if (!urlPattern.test(urlString.trim())) {
        setValidationError('Please enter a valid URL (e.g., https://example.com/article)')
        return false
      }

      setValidationError(null)
      return true
    } catch {
      setValidationError('Invalid URL format')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateUrl(url)) {
      return
    }

    try {
      // Ensure URL has protocol
      let formattedUrl = url.trim()
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`
      }

      await saveUrl({ url: formattedUrl, folder })

      // Reset form and close modal
      setUrl('')
      setFolder('inbox')
      setValidationError(null)
      onSuccess()
      onClose()
    } catch (err) {
      // Error is handled by the hook, but we'll keep the modal open
      console.error('Failed to save URL:', err)
    }
  }

  const handleClose = () => {
    setUrl('')
    setFolder('inbox')
    setContentType('link')
    setValidationError(null)
    onClose()
  }

  const getPlaceholder = () => {
    switch (contentType) {
      case 'link':
        return 'https://example.com/article'
      case 'pdf':
        return 'https://example.com/document.pdf'
      case 'rss':
        return 'https://example.com/feed.xml'
      default:
        return 'Enter URL'
    }
  }

  const getTitle = () => {
    switch (contentType) {
      case 'link':
        return 'Add Link'
      case 'pdf':
        return 'Add PDF'
      case 'rss':
        return 'Add RSS Feed'
      default:
        return 'Add Content'
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content add-link-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getTitle()}</h2>
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="content-type-tabs">
          <button
            type="button"
            className={`content-type-tab ${contentType === 'link' ? 'active' : ''}`}
            onClick={() => {
              setContentType('link')
              setUrl('')
              setValidationError(null)
            }}
          >
            🔗 Link
          </button>
          <button
            type="button"
            className={`content-type-tab ${contentType === 'pdf' ? 'active' : ''}`}
            onClick={() => {
              setContentType('pdf')
              setUrl('')
              setValidationError(null)
            }}
            title="Coming soon in ARC-013"
          >
            📄 PDF
          </button>
          <button
            type="button"
            className={`content-type-tab ${contentType === 'rss' ? 'active' : ''}`}
            onClick={() => {
              setContentType('rss')
              setUrl('')
              setValidationError(null)
            }}
            title="Coming soon in future release"
          >
            📡 RSS
          </button>
        </div>

        {contentType !== 'link' && (
          <div className="coming-soon-notice">
            <p>
              📋 {contentType === 'pdf' ? 'PDF' : 'RSS'} support is coming soon!
              For now, please use the Link tab to add web articles.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="url">
              {contentType === 'link' ? 'URL' : contentType === 'pdf' ? 'PDF URL' : 'RSS Feed URL'}
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setValidationError(null)
              }}
              placeholder={getPlaceholder()}
              className={`url-input ${validationError || error ? 'error' : ''}`}
              disabled={loading || contentType !== 'link'}
              autoFocus
            />
            {validationError && (
              <span className="error-message">{validationError}</span>
            )}
            {error && !validationError && (
              <span className="error-message">{error.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="folder">Save to</label>
            <select
              id="folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value as 'inbox' | 'archive')}
              className="folder-select"
              disabled={loading || contentType !== 'link'}
            >
              <option value="inbox">Inbox</option>
              <option value="archive">Archive</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !url.trim() || contentType !== 'link'}
            >
              {loading ? 'Saving...' : contentType === 'link' ? 'Add Link' : 'Add'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="loading-indicator">
            <div className="spinner-small"></div>
            <span>Saving link...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddLinkModal
