// Reader page component for Omnivore Vite migration
// Displays article content with sanitized HTML

import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { useLibraryItem } from '../lib/graphql-client'
import '../styles/ReaderPage.css'

const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, loading, error, fetchLibraryItem } = useLibraryItem(id || '')

  useEffect(() => {
    if (id) {
      fetchLibraryItem()
    }
  }, [id, fetchLibraryItem])

  const handleBack = () => {
    navigate('/home')
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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
          <p>The article you're looking for doesn't exist or has been deleted.</p>
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
            <p>This article's content is being processed. Please check back in a moment.</p>
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

      <div
        className="reader-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  )
}

export default ReaderPage
