// Zustand stores for Omnivore Vite migration
// Centralised state management with persistence and backend integration

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { apiClient, AUTH_TOKEN_STORAGE_KEY } from '../lib/api-client'
import type { AuthUser, LoginResponse, RegisterResponse } from '../types/api'

const isBrowser = typeof window !== 'undefined'

const fallbackStorage = {
  length: 0,
  clear: () => undefined,
  getItem: () => null,
  key: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
} as Storage

const storeToken = (token: string | null) => {
  if (!isBrowser) return
  try {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    }
  } catch (error) {
    console.warn('Unable to persist auth token', error)
  }
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  statusMessage: string | null
  pendingEmailVerification: boolean

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  setUser: (user: AuthUser | null) => void
  setToken: (token: string | null) => void
  clearError: () => void
  clearStatus: () => void
  verifyAuth: () => Promise<void>
}

const initialAuthState: Omit<
  AuthState,
  'login' | 'register' | 'logout' | 'setUser' | 'setToken' | 'clearError' | 'clearStatus' | 'verifyAuth'
> = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  statusMessage: null,
  pendingEmailVerification: false,
}

const handleAuthSuccess = (response: LoginResponse | RegisterResponse) => {
  if (!response.success) {
    return {
      ...initialAuthState,
      error: response.message || 'Authentication failed',
    }
  }

  if ('pendingEmailVerification' in response) {
    return {
      ...initialAuthState,
      statusMessage: response.message,
      pendingEmailVerification: true,
    }
  }

  if ('accessToken' in response && response.accessToken) {
    storeToken(response.accessToken)
    return {
      user: response.user,
      token: response.accessToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      statusMessage: response.message,
      pendingEmailVerification: false,
    }
  }

  return {
    ...initialAuthState,
    error: 'Authentication response missing access token',
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialAuthState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null, statusMessage: null })
        try {
          const response = await apiClient.login(email, password)
          const nextState = handleAuthSuccess(response)
          set({ ...nextState, isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ ...initialAuthState, error: message })
          storeToken(null)
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null, statusMessage: null })
        try {
          const response = await apiClient.register(email, password, name)
          const nextState = handleAuthSuccess(response)
          set({ ...nextState, isLoading: false })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Registration failed'
          set({ ...initialAuthState, error: message })
          storeToken(null)
        }
      },

      logout: () => {
        storeToken(null)
        void apiClient.logout()
        set({ ...initialAuthState })
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      setToken: (token) => {
        storeToken(token)
        set({ token, isAuthenticated: !!token })
      },

      clearError: () => set({ error: null }),

      clearStatus: () =>
        set({ statusMessage: null, pendingEmailVerification: false }),

      verifyAuth: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await apiClient.verifyAuth()

          if (response.authStatus === 'AUTHENTICATED' && response.user) {
            set({
              user: response.user as AuthUser,
              token: get().token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              statusMessage: null,
              pendingEmailVerification: false,
            })
          } else if (response.authStatus === 'PENDING_USER') {
            set({
              ...initialAuthState,
              statusMessage: 'Please verify your email to activate your account.',
              pendingEmailVerification: true,
              isLoading: false,
            })
          } else {
            set({ ...initialAuthState })
            storeToken(null)
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Auth check failed'
          set({ ...initialAuthState, error: message })
          storeToken(null)
        }
      },
    }),
    {
      name: 'omnivore-auth',
      storage: createJSONStorage(() =>
        isBrowser ? window.localStorage : fallbackStorage
      ),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

interface ThemeState {
  currentTheme: string
  preferredLightTheme: string
  preferredDarkTheme: string
  isDarkMode: boolean

  setTheme: (theme: string) => void
  toggleDarkMode: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'System',
      preferredLightTheme: 'Light',
      preferredDarkTheme: 'Dark',
      isDarkMode: false,

      setTheme: (theme: string) => {
        const { isDarkMode, preferredLightTheme, preferredDarkTheme } = get()

        if (theme === 'System') {
          set({ currentTheme: theme })
          set({
            currentTheme: isDarkMode ? preferredDarkTheme : preferredLightTheme,
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
    }),
    {
      name: 'omnivore-theme',
      storage: createJSONStorage(() =>
        isBrowser ? window.localStorage : fallbackStorage
      ),
    }
  )
)

interface LibraryState {
  articles: any[]
  isLoading: boolean
  error: string | null
  filters: {
    state: string[]
    labels: string[]
    search: string
  }
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  setArticles: (articles: any[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<LibraryState['filters']>) => void
  setPagination: (pagination: Partial<LibraryState['pagination']>) => void
  addArticle: (article: any) => void
  updateArticle: (id: string, updates: Partial<any>) => void
  removeArticle: (id: string) => void
}

export const useLibraryStore = create<LibraryState>()((set) => ({
  articles: [],
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
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  setArticles: (articles) => set({ articles }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setPagination: (pagination) =>
    set((state) => ({ pagination: { ...state.pagination, ...pagination } })),

  addArticle: (article) =>
    set((state) => ({ articles: [article, ...state.articles] })),

  updateArticle: (id, updates) =>
    set((state) => ({
      articles: state.articles.map((article) =>
        article.id === id ? { ...article, ...updates } : article
      ),
    })),

  removeArticle: (id) =>
    set((state) => ({
      articles: state.articles.filter((article) => article.id !== id),
    })),
}))
