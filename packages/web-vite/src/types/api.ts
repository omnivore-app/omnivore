// Core API response types for Omnivore Vite migration
// Mirrors the NestJS authentication contracts so the frontend stays type-safe

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  errorMessage?: string
  errorCode?: string
  timestamp?: string
}

export interface ApiError {
  code: string
  message: string
  timestamp: string
  details?: Record<string, unknown>
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'PENDING_VERIFICATION'
  | 'ACCOUNT_SUSPENDED'
  | 'AUTH_FAILED'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'REGISTRATION_FAILED'

export interface AuthBaseResponse {
  success: boolean
  message: string
  errorCode?: AuthErrorCode
  redirectUrl?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role?: string // Optional - may not be returned in all auth responses
}

export interface LoginSuccessResponse extends AuthBaseResponse {
  success: true
  user: AuthUser
  accessToken: string
  expiresIn: string
}

export interface LoginErrorResponse extends AuthBaseResponse {
  success: false
  errorCode: AuthErrorCode
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse

export interface RegisterSuccessWithLoginResponse extends AuthBaseResponse {
  success: true
  user: AuthUser
  accessToken: string
  expiresIn: string
}

export interface RegisterSuccessWithVerificationResponse extends AuthBaseResponse {
  success: true
  pendingEmailVerification: true
}

export type RegisterResponse =
  | RegisterSuccessWithLoginResponse
  | RegisterSuccessWithVerificationResponse
  | LoginErrorResponse

export type AuthStatus =
  | 'AUTHENTICATED'
  | 'NOT_AUTHENTICATED'
  | 'PENDING_USER'

export interface VerifyAuthResponse {
  authStatus: AuthStatus
  user?: {
    id: string
    email: string
    name: string
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface User {
  id: string
  email: string
  name: string
  picture?: string
  createdAt: string
  updatedAt: string
  isAdmin?: boolean
}

export interface Article {
  id: string
  title: string
  url: string
  content?: string
  description?: string
  author?: string
  publishedAt?: string
  savedAt: string
  readAt?: string
  readingProgress?: number
  state: 'UNREAD' | 'READING' | 'READ' | 'ARCHIVED'
  labels?: Label[]
  highlights?: Highlight[]
  siteName?: string
  image?: string
  wordCount?: number
  readingTime?: number
}

export interface Label {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface Highlight {
  id: string
  text: string
  position: number
  createdAt: string
  updatedAt: string
  note?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface LibraryItemsResponse extends PaginatedResponse<Article> {
  filters: {
    state: string[]
    labels: string[]
    dateRange?: {
      start: string
      end: string
    }
  }
}

export interface Subscription {
  id: string
  name: string
  url: string
  description?: string
  icon?: string
  createdAt: string
  updatedAt: string
  lastFetchedAt?: string
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'
}

export interface Integration {
  id: string
  name: string
  type: 'WEBHOOK' | 'API_KEY' | 'OAUTH'
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'
  createdAt: string
  updatedAt: string
  config?: Record<string, unknown>
}

export interface Theme {
  id: string
  name: string
  type: 'light' | 'dark' | 'system'
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
}

export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

export interface FormError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: FormError[]
}
