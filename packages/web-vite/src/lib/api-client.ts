// Unified API client for Omnivore Vite migration
// Handles REST interactions with the NestJS backend and manages auth headers

import type {
  ApiResponse,
  Article,
  Integration,
  LoginResponse,
  RegisterResponse,
  Subscription,
  VerifyAuthResponse,
} from '../types/api'

const DEFAULT_BASE_URL = '/api/v2'
export const AUTH_TOKEN_STORAGE_KEY = 'omnivore-auth-token'

const resolveBaseUrl = (): string => {
  const envUrl = import.meta.env?.VITE_API_URL as string | undefined
  return (envUrl && envUrl.trim().length > 0 ? envUrl : DEFAULT_BASE_URL).replace(
    /\/$/,
    ''
  )
}

const isBrowser = typeof window !== 'undefined'

const getStoredToken = (): string | null => {
  if (!isBrowser) return null
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch (error) {
    console.warn('Unable to read auth token from storage', error)
    return null
  }
}

const buildUrl = (baseUrl: string, endpoint: string): string => {
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`
  return `${baseUrl}${normalizedEndpoint}`
}

class OmnivoreApiClient {
  private readonly baseUrl: string

  constructor(baseUrl: string = resolveBaseUrl()) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
  ): Promise<T> {
    const url = buildUrl(this.baseUrl, endpoint)
    const token = includeAuth ? getStoredToken() : null

    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `HTTP ${response.status}: ${response.statusText || errorText || 'Request failed'}`
      )
    }

    return (await response.json()) as T
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    )
  }

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<RegisterResponse> {
    return this.request<RegisterResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      },
      false
    )
  }

  async verifyAuth(): Promise<VerifyAuthResponse> {
    const token = getStoredToken()
    if (!token) {
      return { authStatus: 'NOT_AUTHENTICATED' }
    }

    try {
      return await this.request<VerifyAuthResponse>('/auth/verify', {
        method: 'GET',
      })
    } catch (error) {
      // If token is invalid/expired, clear it and return not authenticated
      if (isBrowser) {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      }
      return { authStatus: 'NOT_AUTHENTICATED' }
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Logout request failed', error)
    }
  }

  async googleSignIn(
    idToken: string,
    isLocal = false,
    isVercel = false
  ): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/google-web-signin', {
      method: 'POST',
      body: JSON.stringify({ idToken, isLocal, isVercel }),
    })
  }

  async appleSignIn(
    authorizationCode: string,
    idToken: string,
    user?: { name?: { firstName?: string; lastName?: string }; email?: string }
  ): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/apple-web-signin', {
      method: 'POST',
      body: JSON.stringify({ authorizationCode, idToken, user }),
    })
  }

  async getLibraryItems(
    page = 1,
    pageSize = 20
  ): Promise<ApiResponse<Article[]>> {
    return this.request<ApiResponse<Article[]>>(
      `/library/items?page=${page}&pageSize=${pageSize}`
    )
  }

  async getArticle(id: string): Promise<ApiResponse<Article>> {
    return this.request<ApiResponse<Article>>(`/library/articles/${id}`)
  }

  async updateArticleState(
    id: string,
    state: string
  ): Promise<ApiResponse<Article>> {
    return this.request<ApiResponse<Article>>(`/library/articles/${id}/state`, {
      method: 'PATCH',
      body: JSON.stringify({ state }),
    })
  }

  async deleteArticle(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/library/articles/${id}`, {
      method: 'DELETE',
    })
  }

  async getSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    return this.request<ApiResponse<Subscription[]>>('/subscriptions')
  }

  async createSubscription(
    url: string,
    name: string
  ): Promise<ApiResponse<Subscription>> {
    return this.request<ApiResponse<Subscription>>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ url, name }),
    })
  }

  async getIntegrations(): Promise<ApiResponse<Integration[]>> {
    return this.request<ApiResponse<Integration[]>>('/integrations')
  }
}

export const apiClient = new OmnivoreApiClient()
export { OmnivoreApiClient }
