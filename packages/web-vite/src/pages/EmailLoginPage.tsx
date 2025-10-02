// Email login page component for Omnivore Vite app
// Email/password authentication form

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { loginSchema, type LoginFormData } from '../lib/validation'
import ErrorBoundary from '../components/ErrorBoundary'

const EmailLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError, statusMessage, isAuthenticated } =
    useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Navigate to home after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    clearError()

    try {
      await login(data.email, data.password)
      // Navigation happens via useEffect watching isAuthenticated
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Login failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="auth-page">
        {/* Header with logo */}
        <div className="email-login-header">
          <Link to="/" className="login-logo-link">
            <img
              src="/static/icons/logo-landing.svg"
              alt="Omnivore Logo"
              className="login-logo"
            />
          </Link>
        </div>

        <div className="auth-container">
          <div className="auth-header">
            <h1>Welcome back</h1>
            <p>Sign in to your Omnivore account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {statusMessage && (
              <div className="info-message">{statusMessage}</div>
            )}

            {errors.root && (
              <div className="error-message">{errors.root.message}</div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
                disabled={isSubmitting}
                autoFocus
              />
              {errors.email && (
                <span className="field-error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="field-error">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up
              </Link>
            </p>
            <p>
              <Link to="/login" className="auth-link">
                ← Back to login options
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default EmailLoginPage
