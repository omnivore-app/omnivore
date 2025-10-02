// Enhanced Register page component for Omnivore Vite migration
// Migrated from existing EmailSignup.tsx with improved design and functionality

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { registerSchema, type RegisterFormData } from '../lib/validation'
import ErrorBoundary from '../components/ErrorBoundary'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
    statusMessage,
    pendingEmailVerification,
    isAuthenticated,
  } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  // Navigate to library after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/library', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    clearError()

    try {
      await registerUser(data.email, data.password, data.name)
      // Navigation happens via useEffect watching isAuthenticated
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error ? error.message : 'Registration failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Create your account</h1>
            <p>Join Omnivore to save and organize your reading</p>
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
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name"
                disabled={isSubmitting}
                autoFocus
              />
              {errors.name && (
                <span className="field-error">{errors.name.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
                disabled={isSubmitting}
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
                placeholder="Create a password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="field-error">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className="field-error">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading
                ? 'Creating account...'
                : 'Create account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="auth-link"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4a9eff',
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            </p>
            <p className="terms-notice">
              Omnivore will send you daily tips for your first week as a new
              user. If you don't like them you can unsubscribe.
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default RegisterPage
