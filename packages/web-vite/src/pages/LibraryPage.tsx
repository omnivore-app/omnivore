// Library page component for Omnivore Vite migration
// Displays library items in a clean, modern interface similar to the current web package

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../stores'
import { OmnivoreApiClient } from '../lib/api-client'
import type { Article } from '../types/api'
import ErrorBoundary from '../components/ErrorBoundary'

const LibraryPage: React.FC = () => {
  const { user } = useAuthStore()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])

  useEffect(() => {
    const fetchArticles = async () => {
      if (!user) return

      try {
        setLoading(true)
        const apiClient = new OmnivoreApiClient()
        const response = await apiClient.getLibraryItems(1, 20)

        if (response.success && response.data) {
          setArticles(response.data)
          setFilteredArticles(response.data)
        } else {
          setError(response.errorMessage || 'Failed to fetch articles')
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [user])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles)
      return
    }

    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredArticles(filtered)
  }, [searchQuery, articles])

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

  const getStateColor = (state: string) => {
    switch (state) {
      case 'UNREAD':
        return '#4a9eff'
      case 'READING':
        return '#ffd700'
      case 'ARCHIVED':
        return '#999'
      default:
        return '#4a9eff'
    }
  }

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'UNREAD':
        return 'Unread'
      case 'READING':
        return 'Reading'
      case 'ARCHIVED':
        return 'Archived'
      default:
        return 'Unread'
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
      <div className="library-page">
        <div className="library-header">
          <h1>Your Library</h1>
          <div className="library-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="add-article-btn">+ Add Article</button>
          </div>
        </div>

        <div className="library-stats">
          <div className="stat">
            <span className="stat-number">{articles.length}</span>
            <span className="stat-label">Total Articles</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {articles.filter((a) => a.state === 'UNREAD').length}
            </span>
            <span className="stat-label">Unread</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {articles.filter((a) => a.state === 'READING').length}
            </span>
            <span className="stat-label">Reading</span>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <h2>No articles found</h2>
            <p>
              {searchQuery
                ? `No articles match "${searchQuery}"`
                : 'Your library is empty. Add some articles to get started!'}
            </p>
            {!searchQuery && (
              <button className="add-article-btn">
                + Add Your First Article
              </button>
            )}
          </div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map((article) => (
              <div key={article.id} className="article-card">
                <div className="article-header">
                  <div className="article-state">
                    <span
                      className="state-indicator"
                      style={{ backgroundColor: getStateColor(article.state) }}
                    ></span>
                    <span className="state-label">
                      {getStateLabel(article.state)}
                    </span>
                  </div>
                  <div className="article-date">
                    {formatDate(article.savedAt)}
                  </div>
                </div>

                <h3 className="article-title">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-link"
                  >
                    {article.title}
                  </a>
                </h3>

                <div className="article-meta">
                  <span className="article-url">{article.url}</span>
                </div>

                {article.labels && article.labels.length > 0 && (
                  <div className="article-labels">
                    {article.labels.map((label, index) => (
                      <span key={index} className="label">
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="article-actions">
                  <button className="action-btn">Read</button>
                  <button className="action-btn">Archive</button>
                  <button className="action-btn">Share</button>
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
