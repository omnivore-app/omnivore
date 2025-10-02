// Tests for API client
// Comprehensive testing of API communication

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { OmnivoreApiClient, AUTH_TOKEN_STORAGE_KEY } from '../api-client'
import { mockUser, mockArticle } from '../../test/utils'

const fetchMock = () => fetch as unknown as Mock

const createFetchResponse = <T>(
  data: T,
  overrides: Partial<Response> = {}
): Response => {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(data as unknown as any),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
    redirected: false,
    type: 'default',
    url: 'http://localhost/mock',
    clone() {
      return this
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.reject(new Error('Not implemented')),
    formData: () => Promise.reject(new Error('Not implemented')),
    ...overrides,
  } as unknown as Response
}

describe('OmnivoreApiClient', () => {
  let apiClient: OmnivoreApiClient

  beforeEach(() => {
    apiClient = new OmnivoreApiClient('/api/v2')
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        success: true as const,
        message: 'Login successful',
        redirectUrl: '/home',
        user: mockUser,
        accessToken: 'test-token',
        expiresIn: '1h',
      }

      fetchMock().mockResolvedValueOnce(createFetchResponse(mockResponse))

      const result = await apiClient.login('test@example.com', 'password')

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        '/api/v2/auth/login',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      )
    })

    it('should return error response when login fails', async () => {
      const mockResponse = {
        success: false as const,
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS' as const,
      }

      fetchMock().mockResolvedValueOnce(createFetchResponse(mockResponse))

      const result = await apiClient.login('test@example.com', 'wrong-password')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('INVALID_CREDENTIALS')
    })

    it('should register successfully', async () => {
      const mockResponse = {
        success: true as const,
        message: 'Registration successful',
        redirectUrl: '/home',
        user: mockUser,
        accessToken: 'test-token',
        expiresIn: '1h',
      }

      fetchMock().mockResolvedValueOnce(createFetchResponse(mockResponse))

      const result = await apiClient.register(
        'test@example.com',
        'password',
        'Test User'
      )

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        '/api/v2/auth/register',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password',
            name: 'Test User',
          }),
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      )
    })
  })

  describe('Library Operations', () => {
    beforeEach(() => {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'test-token')
    })

    it('should fetch library items', async () => {
      const mockResponse = {
        success: true,
        data: [mockArticle],
      }

      fetchMock().mockResolvedValueOnce(createFetchResponse(mockResponse))

      const result = await apiClient.getLibraryItems(1, 20)

      expect(result.data).toEqual([mockArticle])
      expect(fetch).toHaveBeenCalledWith(
        '/api/v2/library/items?page=1&pageSize=20',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('should fetch single article', async () => {
      const mockResponse = {
        success: true,
        data: mockArticle,
      }

      fetchMock().mockResolvedValueOnce(createFetchResponse(mockResponse))

      const result = await apiClient.getArticle('1')

      expect(result.data).toEqual(mockArticle)
      expect(fetch).toHaveBeenCalledWith(
        '/api/v2/library/articles/1',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('should update article state', async () => {
      const updatedArticle = { ...mockArticle, state: 'READ' }
      const mockResponse = {
        success: true,
        data: updatedArticle,
      }

      fetchMock().mockResolvedValueOnce(createFetchResponse(mockResponse))

      const result = await apiClient.updateArticleState('1', 'READ')

      expect(result.data).toEqual(updatedArticle)
      expect(fetch).toHaveBeenCalledWith(
        '/api/v2/library/articles/1/state',
        expect.objectContaining({
          method: 'PATCH',
          credentials: 'include',
          body: JSON.stringify({ state: 'READ' }),
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should delete article', async () => {
      const mockResponse = {
        success: true,
      }

      fetchMock().mockResolvedValueOnce(createFetchResponse(mockResponse))

      const result = await apiClient.deleteArticle('1')

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        '/api/v2/library/articles/1',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      fetchMock().mockRejectedValueOnce(new Error('Network error'))

      await expect(
        apiClient.login('test@example.com', 'password')
      ).rejects.toThrow('Network error')
    })

    it('should handle HTTP errors', async () => {
      fetchMock().mockResolvedValueOnce(
        createFetchResponse(
          { message: 'Bad Request' },
          {
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            text: () => Promise.resolve('Bad Request'),
          }
        )
      )

      await expect(
        apiClient.login('test@example.com', 'password')
      ).rejects.toThrow('Bad Request')
    })
  })
})
