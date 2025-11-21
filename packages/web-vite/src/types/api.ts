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

export interface RegisterSuccessWithVerificationResponse
  extends AuthBaseResponse {
  success: true
  pendingEmailVerification: true
}

export type RegisterResponse =
  | RegisterSuccessWithLoginResponse
  | RegisterSuccessWithVerificationResponse
  | LoginErrorResponse

export type AuthStatus = 'AUTHENTICATED' | 'NOT_AUTHENTICATED' | 'PENDING_USER'

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
  readingProgress?: number // Deprecated: use readingProgressPercent
  readingProgressPercent?: number | null // Reading progress 0-100 based on sentinels
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
  description?: string | null
  createdAt?: string
  // ARC-009B: Distinguish between system labels (Flair) and user tags
  // Flair = system-managed labels with icons (e.g., "Newsletter", "RSS")
  // Tags = user-created labels with colors
  internal?: boolean // true for system labels (Flair), false for user tags
}

// Highlight anchoring types for robust text positioning
export type HighlightColor = 'YELLOW' | 'RED' | 'GREEN' | 'BLUE'

export interface AnchorDomRange {
  startPath: string
  startOffset: number
  endPath: string
  endOffset: number
}

export interface AnchorTextPosition {
  start: number
  end: number
  version?: string
}

export interface AnchorTextQuote {
  exact: string
  prefix?: string
  suffix?: string
}

export interface AnchoredSelectors {
  domRange?: AnchorDomRange
  textPosition?: AnchorTextPosition
  textQuote?: AnchorTextQuote
}

export interface Highlight {
  id: string
  quote: string // The highlighted text
  annotation?: string | null
  color: HighlightColor
  highlightPositionPercent: number
  highlightPositionAnchorIndex: number
  prefix?: string | null
  suffix?: string | null
  createdAt: string
  updatedAt: string
  // New: Anchored selectors for robust positioning
  selectors?: AnchoredSelectors
}

export type HighlightLike = Pick<
  Highlight,
  'id' | 'color' | 'annotation' | 'selectors' | 'quote' | 'prefix' | 'suffix'
>

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

export type LibraryItemState =
  | 'FAILED'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'DELETED'
  | 'ARCHIVED'
  | 'CONTENT_NOT_FETCHED'

export interface LibraryItem {
  id: string
  title: string
  slug: string
  originalUrl: string
  author?: string | null
  description?: string | null
  content?: string | null
  savedAt: string
  createdAt: string
  publishedAt?: string | null
  readAt?: string | null
  updatedAt: string
  state: LibraryItemState
  contentReader: string
  folder: string
  labels?: Label[] | null
  // ARC-009: Enhanced metadata fields for rich library UI
  thumbnail?: string | null
  wordCount?: number | null
  siteName?: string | null
  siteIcon?: string | null
  itemType: string
  // ARC-010: Notebook feature
  note?: string | null
  noteUpdatedAt?: string | null
  // Sentinel-based reading progress percentage (0-100)
  readingProgressPercent?: number | null
}

export interface DeleteResult {
  success: boolean
  message?: string
  itemId?: string
}

export interface LibraryItemsConnection {
  items: LibraryItem[]
  nextCursor: string | null
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

// Library search sort options
export type LibrarySortBy =
  | 'SAVED_AT'
  | 'UPDATED_AT'
  | 'PUBLISHED_AT'
  | 'TITLE'
  | 'AUTHOR'

export type LibrarySortOrder = 'ASC' | 'DESC'

export interface LibrarySearchInput {
  query?: string
  folder?: string
  labels?: string[]
  sortBy?: LibrarySortBy
  sortOrder?: LibrarySortOrder
  state?: LibraryItemState
}
