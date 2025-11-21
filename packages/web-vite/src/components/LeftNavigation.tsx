// Left navigation panel component - matches legacy Omnivore UI
// Features: Main nav (Home, Library, Highlights, etc.) + Shortcuts section

import '../styles/LeftNavigation.css'

import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  count?: number
}

interface ShortcutItem {
  id: string
  label: string
  icon: string
  filter?: string
}

const LeftNavigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isShortcutsExpanded, setIsShortcutsExpanded] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const mainNavItems: NavItem[] = [
    { id: 'library', label: 'Library', icon: '📚', path: '/home' },
    { id: 'highlights', label: 'Highlights', icon: '✏️', path: '/highlights' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '📡', path: '/subscriptions' },
    { id: 'labels', label: 'Labels', icon: '🏷️', path: '/labels' }
  ]

  const quickFilters: ShortcutItem[] = [
    { id: 'inbox', label: 'Inbox', icon: '📥', filter: 'inbox' },
    { id: 'reading', label: 'Reading', icon: '📖', filter: 'reading' },
    { id: 'archive', label: 'Archive', icon: '📦', filter: 'archive' },
    { id: 'trash', label: 'Trash', icon: '🗑️', filter: 'trash' }
  ]

  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  const handleQuickFilterClick = (filter: string) => {
    // Navigate to home with query param
    navigate(`/home?filter=${filter}`)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="nav-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left navigation panel */}
      <nav className={`left-navigation ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Close button for mobile */}
        <button
          className="nav-close-btn"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close navigation menu"
        >
          ✕
        </button>

        {/* Main navigation items */}
        <div className="nav-section main-nav">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.count !== undefined && (
                <span className="nav-count">{item.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Quick Filters section */}
        <div className="nav-section shortcuts-section">
          <div className="shortcuts-header">
            <h3 className="shortcuts-title">Quick Filters</h3>
            <button
              className="shortcuts-toggle"
              onClick={() => setIsShortcutsExpanded(!isShortcutsExpanded)}
              aria-label={isShortcutsExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              {isShortcutsExpanded ? '−' : '+'}
            </button>
          </div>

          {isShortcutsExpanded && (
            <div className="shortcuts-list">
              {quickFilters.map((filter) => (
                <button
                  key={filter.id}
                  className="shortcut-item"
                  onClick={() => handleQuickFilterClick(filter.filter || '')}
                  title={filter.label}
                >
                  <span className="shortcut-icon">{filter.icon}</span>
                  <span className="shortcut-label">{filter.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="nav-footer">
          <div className="nav-footer-text">
            Omnivore
          </div>
        </div>
      </nav>
    </>
  )
}

export default LeftNavigation
