// Apple Sign In button component for UI display
// Simplified, reliable implementation with clean SVG

import React from 'react'

export interface AppleSignInButtonProps {
  onClick?: () => void
}

export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({ onClick }) => {
  return (
    <button
      id="appleid-signin"
      className="apple-signin-button"
      onClick={onClick}
      type="button"
      aria-label="Continue with Apple"
      style={{
        backgroundColor: '#000',
        border: 'none',
        borderRadius: '5px',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '15px',
        fontWeight: 500,
        height: '44px',
        padding: '0 16px',
        gap: '8px',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
    >
      {/* Apple Logo SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 25 25"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M19.49 13.96c-.02 2.17 1.91 3.24 1.93 3.25-.02.05-.3 1.03-1 2.04-.6.87-1.23 1.74-2.21 1.76-.96.02-1.27-.57-2.37-.57-1.1 0-1.44.55-2.35.59-1.04.04-1.68-.95-2.29-1.82-1.24-1.8-2.19-5.09-0.92-7.31.63-1.1 1.76-1.8 2.98-1.82.93-.02 1.81.63 2.38.63.57 0 1.63-.77 2.75-.66.47.02 1.78.19 2.62 1.43-.07.04-1.57.91-1.54 2.72v-.01l.02-.23zM15.93 5.96c.5-.61.84-1.46.75-2.31-.72.03-1.6.48-2.12 1.09-.46.53-.86 1.4-.76 2.22.81.06 1.63-.41 2.13-1v.01z"
          fill="#fff"
        />
      </svg>
      <span>Continue with Apple</span>
    </button>
  )
}
