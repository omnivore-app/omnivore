// React Router setup with protected routes for Omnivore Vite migration
// Single-page application with authentication-based routing

import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import { useAuthStore } from '../stores'
import { ErrorBoundary } from '../components/ErrorBoundary'
import LeftNavigation from '../components/LeftNavigation'

// Lazy load components for better performance
const LandingPage = React.lazy(() => import('../pages/LandingPage'))
const LoginPage = React.lazy(() => import('../pages/LoginPage'))
const EmailLoginPage = React.lazy(() => import('../pages/EmailLoginPage'))
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'))
const LibraryPage = React.lazy(() => import('../pages/LibraryPage'))
const LabelsPage = React.lazy(() => import('../pages/LabelsPage'))
const ReaderPage = React.lazy(() => import('../pages/ReaderPage'))
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'))
const AdminPage = React.lazy(() => import('../pages/AdminPage'))
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'))

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
)

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/library" replace />
  }

  return <>{children}</>
}

// Public Route component (redirects authenticated users)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

// Home Route component (landing page for unauthenticated, /home for authenticated)
const HomeRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return <LandingPage />
}

// Layout component with left navigation
const AppLayout: React.FC = () => {
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="app-layout">
      {/* Left navigation panel */}
      <LeftNavigation />

      {/* Main content area */}
      <div className="main-content-wrapper">
        {/* Top bar with user actions */}
        <header className="top-bar">
          <div className="top-bar-left">
            {/* Search will be in individual pages */}
          </div>
          <div className="top-bar-right">
            <a href="/settings" className="top-bar-link">
              ⚙️ Settings
            </a>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Main App Router
const AppRouter: React.FC = () => {
  const { verifyAuth, isLoading } = useAuthStore()

  // Verify authentication on mount
  React.useEffect(() => {
    verifyAuth()
  }, [verifyAuth])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Landing page - shows splash for unauthenticated, redirects authenticated to /home */}
            <Route path="/" element={<HomeRoute />} />

            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/email-login"
              element={
                <PublicRoute>
                  <EmailLoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="home" element={<LibraryPage />} />
              <Route path="library" element={<Navigate to="/home" replace />} />
              <Route path="labels" element={<LabelsPage />} />
              <Route path="reader/:id" element={<ReaderPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default AppRouter
