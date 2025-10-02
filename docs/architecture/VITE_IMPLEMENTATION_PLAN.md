# 🚀 Vite Migration Implementation Plan with Zustand & Error Handling

## 📋 Updated Implementation Plan

### **Phase 1: Foundation (Week 1)**

#### **Day 1-2: Core Setup**

```bash
# 1. Create Vite project
mkdir packages/web-vite
cd packages/web-vite
npm create vite@latest . -- --template react-ts

# 2. Install core dependencies
npm install @tanstack/react-query @apollo/client zustand react-router-dom
npm install @radix-ui/react-* @stitches/react

# 3. Install error handling & validation
npm install zod react-hook-form @hookform/resolvers
npm install react-error-boundary
```

#### **Day 3-4: State Management & API Client**

```typescript
// 1. Zustand auth store
// 2. Unified API client with error handling
// 3. TypeScript response types
// 4. Error boundary setup
```

#### **Day 5-7: Routing & Auth Flow**

```typescript
// 1. React Router setup
// 2. Protected routes
// 3. Auth flow migration
// 4. Basic error handling
```

### **Phase 2: Core Migration (Week 2)**

#### **Day 1-3: Library Management**

```typescript
// 1. Library components migration
// 2. Article management
// 3. Search functionality
// 4. Error handling for data operations
```

#### **Day 4-5: Reader & Settings**

```typescript
// 1. Article reader migration
// 2. Settings pages
// 3. Theme management with Zustand
// 4. Form validation with Zod
```

### **Phase 3: Polish & Deploy (Week 3)**

#### **Day 1-2: Error Handling & Validation**

```typescript
// 1. Comprehensive error boundaries
// 2. API error handling
// 3. Form validation
// 4. User feedback systems
```

#### **Day 3-5: Testing & Production**

```typescript
// 1. Unit tests
// 2. E2E tests
// 3. Production deployment
// 4. Error monitoring
```

---

## 🔐 Zustand Integration

### **Auth Store Implementation**

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '../services/api-client'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setToken: (token: string) => void
  clearError: () => void
  verifyAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const data = await apiClient.login(email, password)

          if (data.success) {
            set({
              user: data.user,
              token: data.accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              isLoading: false,
              error: data.errorMessage || 'Login failed',
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          })
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
        localStorage.removeItem('authToken')
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: !!token })
      },

      clearError: () => {
        set({ error: null })
      },

      verifyAuth: async () => {
        const { token } = get()
        if (!token) return

        try {
          const user = await apiClient.verifyToken(token)
          set({ user, isAuthenticated: true })
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'omnivore-auth',
      storage: localStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

### **Theme Store Implementation**

```typescript
// src/stores/theme-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  currentTheme: string
  preferredLightTheme: string
  preferredDarkTheme: string
  isDarkMode: boolean

  setTheme: (theme: string) => void
  toggleDarkMode: () => void
  setPreferredLightTheme: (theme: string) => void
  setPreferredDarkTheme: (theme: string) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'Light',
      preferredLightTheme: 'Light',
      preferredDarkTheme: 'Dark',
      isDarkMode: false,

      setTheme: (theme: string) => {
        const { isDarkMode, preferredLightTheme, preferredDarkTheme } = get()

        if (theme === 'System') {
          set({ currentTheme: theme })
          set({
            isDarkMode: isDarkMode ? preferredDarkTheme : preferredLightTheme,
          })
        } else {
          set({ currentTheme: theme })

          if (theme.includes('Dark')) {
            set({ preferredDarkTheme: theme, isDarkMode: true })
          } else {
            set({ preferredLightTheme: theme, isDarkMode: false })
          }
        }
      },

      toggleDarkMode: () => {
        const { isDarkMode, preferredLightTheme, preferredDarkTheme } = get()
        set({ isDarkMode: !isDarkMode })
        set({
          currentTheme: !isDarkMode ? preferredDarkTheme : preferredLightTheme,
        })
      },

      setPreferredLightTheme: (theme: string) => {
        set({ preferredLightTheme: theme })
      },

      setPreferredDarkTheme: (theme: string) => {
        set({ preferredDarkTheme: theme })
      },
    }),
    {
      name: 'omnivore-theme',
      storage: localStorage,
    }
  )
)
```

---

## 🛡️ Comprehensive Error Handling Strategy

### **1. API Response Types**

```typescript
// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  page: number
  pageSize: number
}

// Specific API response types
export interface LoginResponse {
  success: boolean
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ArticleResponse {
  id: string
  title: string
  url: string
  content: string
  author: string
  publishedAt: string
  savedAt: string
  state: 'UNREAD' | 'READ' | 'ARCHIVED'
  labels: Label[]
}

export interface LibraryItemsResponse
  extends PaginatedResponse<ArticleResponse> {
  filters: {
    state: string[]
    labels: string[]
    dateRange: {
      start: string
      end: string
    }
  }
}
```

### **2. Error Boundary Components**

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

// src/components/ErrorFallback.tsx
import React from 'react'
import { Button } from '@radix-ui/react-button'

interface ErrorFallbackProps {
  error: Error | null
  resetError?: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <details>
        <summary>Error details</summary>
        <pre>{error?.message}</pre>
        <pre>{error?.stack}</pre>
      </details>
      {resetError && <Button onClick={resetError}>Try again</Button>}
    </div>
  )
}
```

### **3. API Client with Error Handling**

```typescript
// src/services/api-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import {
  ApiResponse,
  ApiError,
  LoginResponse,
  ArticleResponse,
} from '../types/api'

class OmnivoreApiClient {
  private apolloClient: ApolloClient<any>
  private baseUrl: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001'
    this.setupApolloClient()
  }

  private setupApolloClient() {
    const httpLink = createHttpLink({
      uri: `${this.baseUrl}/api/graphql`,
    })

    const authLink = setContext((_, { headers }) => {
      const token = localStorage.getItem('authToken')

      return {
        headers: {
          ...headers,
          'X-OmnivoreClient': 'web',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    })

    const errorLink = onError(
      ({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
          graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(
              `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          })
        }

        if (networkError) {
          console.error(`Network error: ${networkError}`)
        }
      }
    )

    this.apolloClient = new ApolloClient({
      link: errorLink.concat(authLink.concat(httpLink)),
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              libraryItems: {
                merge: false,
              },
            },
          },
        },
      }),
    })
  }

  getApolloClient() {
    return this.apolloClient
  }

  // REST API methods with error handling
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.errorMessage || 'Login failed')
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Token verification error:', error)
      throw error
    }
  }

  async getLibraryItems(
    page = 1,
    pageSize = 20
  ): Promise<ApiResponse<ArticleResponse[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v2/library/items?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get library items error:', error)
      throw error
    }
  }
}

export const apiClient = new OmnivoreApiClient()
```

### **4. Form Validation with Zod**

```typescript
// src/schemas/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL'),
  content: z.string().optional(),
  labels: z.array(z.string()).optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ArticleFormData = z.infer<typeof articleSchema>
```

### **5. Custom Hooks with Error Handling**

```typescript
// src/hooks/useApi.ts
import { useState, useCallback } from 'react'
import { ApiResponse, ApiError } from '../types/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const data = await apiFunction(...args)
        setState({ data, loading: false, error: null })
        return data
      } catch (error) {
        const apiError: ApiError = {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }

        setState({ data: null, loading: false, error: apiError })
        return null
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}

// Usage example
export function useLibraryItems() {
  return useApi(apiClient.getLibraryItems)
}
```

### **6. Error Handling in Components**

```typescript
// src/components/LibraryPage.tsx
import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { useLibraryItems } from '../hooks/useApi'
import { useAuthStore } from '../stores/auth-store'
import { ErrorFallback } from './ErrorFallback'

export function LibraryPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { data: items, loading, error, execute } = useLibraryItems()

  if (!isAuthenticated) {
    return <div>Please log in to view your library</div>
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error loading library</h3>
        <p>{error.message}</p>
        <button onClick={() => execute()}>Retry</button>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="library-page">
        <h1>Welcome back, {user?.name}</h1>
        <div className="library-items">
          {items?.map((item) => (
            <ArticleCard key={item.id} article={item} />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  )
}
```

---

## 🎯 Implementation Benefits

### **1. Zustand Benefits**

- ✅ **Centralized state**: Auth and theme state in one place
- ✅ **Automatic persistence**: No more manual localStorage management
- ✅ **Performance**: Selective updates prevent unnecessary re-renders
- ✅ **TypeScript**: Excellent type safety and inference
- ✅ **DevTools**: Time travel debugging and state inspection

### **2. Error Handling Benefits**

- ✅ **Comprehensive coverage**: API, component, and form errors
- ✅ **User-friendly**: Clear error messages and recovery options
- ✅ **Developer-friendly**: Detailed error logging and debugging
- ✅ **Type-safe**: Proper TypeScript types for all error scenarios
- ✅ **Recovery mechanisms**: Retry buttons and error boundaries

### **3. Development Benefits**

- ✅ **Consistent patterns**: Unified error handling across the app
- ✅ **Easy testing**: Mockable API client and error scenarios
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Scalable**: Easy to extend with new error types and handling

**This gives you a robust foundation for the Vite migration with excellent error handling and state management.**
