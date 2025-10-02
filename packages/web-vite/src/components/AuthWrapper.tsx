// Auth wrapper component - DEPRECATED
// This component is no longer used as AppRouter handles all routing now
// Keeping for backwards compatibility but should be removed in next cleanup
import React from 'react'
import { useAuthStore } from '../stores'
import LibraryPage from '../pages/LibraryPage'
import LoginPage from '../pages/LoginPage'
import ErrorBoundary from './ErrorBoundary'

const AuthWrapper: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore()

  return (
    <ErrorBoundary fallback={<div>Something went wrong!</div>}>
      {user && (
        <header className="app-header">
          <nav className="app-nav">
            <span style={{ color: '#d9d9d9' }}>
              Welcome, {user.name || user.email}
            </span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </nav>
        </header>
      )}
      <main className="app-main">
        {isAuthenticated ? <LibraryPage /> : <LoginPage />}
      </main>
    </ErrorBoundary>
  )
}

export default AuthWrapper
