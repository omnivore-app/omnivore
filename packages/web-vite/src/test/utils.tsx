// Test utilities for Omnivore Vite migration
// Reusable test helpers and mocks

import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: any }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock authentication responses
export const mockLoginSuccessResponse = {
  success: true as const,
  message: 'Login successful',
  redirectUrl: '/home',
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
  },
  accessToken: 'test-token',
  expiresIn: '1h',
}

export const mockLoginErrorResponse = {
  success: false as const,
  message: 'Invalid email or password',
  errorCode: 'INVALID_CREDENTIALS' as const,
}

export const mockRegisterPendingResponse = {
  success: true as const,
  message: 'Verification required',
  redirectUrl: '/auth/email-login',
  pendingEmailVerification: true as const,
}

// Mock user data compatible with AuthUser
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
}

// Mock article data
export const mockArticle = {
  id: '1',
  title: 'Test Article',
  url: 'https://example.com/article',
  description: 'A test article',
  state: 'UNREAD' as const,
  savedAt: '2024-01-01T00:00:00Z',
}

// Mock auth store state
export const mockAuthState = {
  user: mockUser,
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  statusMessage: null,
  pendingEmailVerification: false,
}

// Mock library store state
export const mockLibraryState = {
  articles: [mockArticle],
  isLoading: false,
  error: null,
  filters: {
    state: [],
    labels: [],
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 20,
    totalCount: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

export * from '@testing-library/react'
export { customRender as render }
