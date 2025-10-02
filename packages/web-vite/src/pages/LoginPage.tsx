// Login page component for Omnivore Vite app
// Replicates legacy login page with OAuth and email options

import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { AppleSignInButton } from '../components/AppleSignInButton'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const googleClientId = import.meta.env.VITE_GAUTH_CLIENT_ID
  const hasGoogleAuth = googleClientId && googleClientId.trim().length > 0

  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID
  const hasAppleAuth = appleClientId && appleClientId.trim().length > 0

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="login-layout">
      {/* Header with logo */}
      <div className="login-header">
        <Link to="/" className="login-logo-link">
          <img
            src="/static/icons/logo-landing.svg"
            alt="Omnivore Logo"
            className="login-logo"
          />
        </Link>
      </div>

      {/* Main content area */}
      <div className="login-content-wrapper">
        {/* Left side - Login form */}
        <div className="login-form-container">
          <div className="login-form-content">
            <h1 className="login-title">Read-it-later for serious readers.</h1>
            <p className="login-subtitle">
              Save articles and read them later in our distraction-free reader.
            </p>
            <Link to="/" className="login-learn-more">
              Learn More -&gt;
            </Link>

            <div className="login-spacer"></div>

            {/* OAuth Buttons */}
            <div className="login-buttons-container">
              {/* Google Sign-In Button - Only show if configured */}
              {hasGoogleAuth && (
                <>
                  <div
                    id="g_id_onload"
                    data-client_id={googleClientId}
                    data-context="use"
                    data-ux_mode="popup"
                    data-login_uri={`${import.meta.env.VITE_API_URL}/auth/google-web-signin`}
                    data-auto_prompt="false"
                  />
                  <div
                    className="g_id_signin"
                    data-type="standard"
                    data-shape="rectangular"
                    data-theme="outline"
                    data-text="continue_with"
                    data-size="large"
                    data-logo_alignment="center"
                    data-width="261"
                  />
                  <div className="login-button-spacer"></div>
                </>
              )}

              {/* Apple Sign-In Button - Only show if configured */}
              {hasAppleAuth && (
                <>
                  <AppleSignInButton />
                  <div className="login-button-spacer"></div>
                </>
              )}

              {/* OAuth Setup Notice - Show when OAuth is not configured */}
              {!hasGoogleAuth && !hasAppleAuth && (
                <div className="oauth-notice">
                  <p className="oauth-notice-text">
                    OAuth providers are not configured yet. Please set up Google
                    or Apple authentication, or continue with email.
                  </p>
                  <div className="login-button-spacer"></div>
                </div>
              )}

              {/* Email Login Link - Always visible */}
              <Link to="/auth/email-login" className="login-email-link">
                Continue with Email
              </Link>
            </div>

            {/* Terms and Conditions */}
            <p className="login-terms">
              By signing up, you agree to Omnivore's{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="login-terms-link"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="login-terms-link"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Right side - Feature image (hidden on mobile) */}
        <div className="login-feature-image"></div>
      </div>
    </div>
  )
}

export default LoginPage
