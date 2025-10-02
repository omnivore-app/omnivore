// Tests for Zustand auth store
// Ensure authentication state management matches the NestJS contracts

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/api-client', () => {
  const login = vi.fn()
  const register = vi.fn()
  const verifyAuth = vi.fn()
  const logout = vi.fn()

  return {
    apiClient: { login, register, verifyAuth, logout },
    AUTH_TOKEN_STORAGE_KEY: 'omnivore-auth-token',
  }
})

import {
  mockUser,
  mockLoginSuccessResponse,
  mockLoginErrorResponse,
  mockRegisterPendingResponse,
} from '../../test/utils'
import { useAuthStore } from '../index'
import { apiClient, AUTH_TOKEN_STORAGE_KEY } from '../../lib/api-client'

const mockedApiClient = apiClient as unknown as {
  login: ReturnType<typeof vi.fn>
  register: ReturnType<typeof vi.fn>
  verifyAuth: ReturnType<typeof vi.fn>
  logout: ReturnType<typeof vi.fn>
}

const resetAuthStore = () => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    statusMessage: null,
    pendingEmailVerification: false,
  })
}

describe('Auth Store', () => {
  beforeEach(() => {
    resetAuthStore()
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('initialises with default state', () => {
    const state = useAuthStore.getState()

    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.statusMessage).toBeNull()
    expect(state.pendingEmailVerification).toBe(false)
  })

  it('sets user and token manually', () => {
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().setToken('manual-token')

    const state = useAuthStore.getState()

    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe('manual-token')
    expect(state.isAuthenticated).toBe(true)
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(
      'manual-token'
    )
  })

  it('handles successful login', async () => {
    mockedApiClient.login.mockResolvedValueOnce(mockLoginSuccessResponse)

    await useAuthStore.getState().login('test@example.com', 'password')

    const state = useAuthStore.getState()

    expect(mockedApiClient.login).toHaveBeenCalledWith(
      'test@example.com',
      'password'
    )
    expect(state.user).toEqual(mockLoginSuccessResponse.user)
    expect(state.token).toBe(mockLoginSuccessResponse.accessToken)
    expect(state.isAuthenticated).toBe(true)
    expect(state.error).toBeNull()
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(
      mockLoginSuccessResponse.accessToken
    )
  })

  it('handles login error response', async () => {
    mockedApiClient.login.mockResolvedValueOnce(mockLoginErrorResponse)

    await useAuthStore.getState().login('test@example.com', 'wrong-password')

    const state = useAuthStore.getState()

    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBe(mockLoginErrorResponse.message)
  })

  it('handles network error during login', async () => {
    mockedApiClient.login.mockRejectedValueOnce(new Error('Network error'))

    await useAuthStore.getState().login('test@example.com', 'password')

    const state = useAuthStore.getState()

    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBe('Network error')
  })

  it('handles registration requiring verification', async () => {
    mockedApiClient.register.mockResolvedValueOnce(mockRegisterPendingResponse)

    await useAuthStore
      .getState()
      .register('test@example.com', 'password', 'Test User')

    const state = useAuthStore.getState()

    expect(state.isAuthenticated).toBe(false)
    expect(state.pendingEmailVerification).toBe(true)
    expect(state.statusMessage).toBe(mockRegisterPendingResponse.message)
  })

  it('logs out and clears state', () => {
    useAuthStore.setState({
      user: mockUser,
      token: 'seed-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      statusMessage: null,
      pendingEmailVerification: false,
    })
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'seed-token')

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()

    expect(mockedApiClient.logout).toHaveBeenCalled()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('verifies auth successfully when token is present', async () => {
    mockedApiClient.verifyAuth.mockResolvedValueOnce({
      authStatus: 'AUTHENTICATED',
      user: mockUser,
    })

    useAuthStore.setState({
      user: null,
      token: 'existing-token',
      isAuthenticated: false,
      isLoading: false,
      error: null,
      statusMessage: null,
      pendingEmailVerification: false,
    })
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'existing-token')

    await useAuthStore.getState().verifyAuth()

    const state = useAuthStore.getState()

    expect(mockedApiClient.verifyAuth).toHaveBeenCalledTimes(1)
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.error).toBeNull()
  })

  it('clears auth when verify runs without token', async () => {
    await useAuthStore.getState().verifyAuth()

    const state = useAuthStore.getState()

    expect(mockedApiClient.verifyAuth).not.toHaveBeenCalled()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
