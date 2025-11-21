// React Error Boundaries for Omnivore Vite migration
// Comprehensive error handling with graceful fallbacks

import React, { type ReactNode, Component } from 'react'

import { type ApiError } from '../types/api'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary()
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
interface DefaultErrorFallbackProps {
  error: Error | null
  resetError?: () => void
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div className="error-boundary">
      <div className="error-content">
        <h2>Something went wrong</h2>
        <p>
          We're sorry, but something unexpected happened. Please try refreshing
          the page.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="error-details">
            <summary>Error Details</summary>
            <pre>{error.message}</pre>
            <pre>{error.stack}</pre>
          </details>
        )}

        {resetError && (
          <button onClick={resetError} className="retry-button">
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

// API Error Boundary for handling API-specific errors
interface ApiErrorBoundaryProps {
  children: ReactNode
  onApiError?: (error: ApiError) => void
}

export const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({
  children,
  onApiError,
}) => {
  const handleError = (error: Error, _errorInfo: React.ErrorInfo) => {
    // Check if it's an API error
    if (error.name === 'ApiError' || error.message.includes('API')) {
      const apiError: ApiError = {
        code: 'API_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      }

      if (onApiError) {
        onApiError(apiError)
      }
    }
  }

  return <ErrorBoundary onError={handleError}>{children}</ErrorBoundary>
}

// Network Error Boundary for handling network issues
interface NetworkErrorBoundaryProps {
  children: ReactNode
  onNetworkError?: (error: Error) => void
}

export const NetworkErrorBoundary: React.FC<NetworkErrorBoundaryProps> = ({
  children,
  onNetworkError,
}) => {
  const handleError = (error: Error, _errorInfo: React.ErrorInfo) => {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      if (onNetworkError) {
        onNetworkError(error)
      }
    }
  }

  return <ErrorBoundary onError={handleError}>{children}</ErrorBoundary>
}

// Route Error Boundary for handling routing errors
interface RouteErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({
  children,
  fallback,
}) => {
  const routeErrorFallback = (
    <div className="route-error">
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <button onClick={() => window.history.back()}>Go Back</button>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback || routeErrorFallback}>
      {children}
    </ErrorBoundary>
  )
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`

  return WrappedComponent
}

export default ErrorBoundary
