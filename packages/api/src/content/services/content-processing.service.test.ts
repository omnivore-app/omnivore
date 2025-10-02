/**
 * Content Processing Service Unit Tests
 *
 * Tests the core content processing service logic in isolation
 */

import { ContentProcessingService } from './content-processing.service'
import { ContentValidationService } from './content-validation.service'
import { ContentCacheService } from './content-cache.service'
import { ContentEnrichmentService } from './content-enrichment.service'
import { ContentExtractionService } from './content-extraction.service'

// Mock the dependencies
jest.mock('./content-validation.service')
jest.mock('./content-cache.service')
jest.mock('./content-enrichment.service')
jest.mock('./content-extraction.service')

// Test data factories for maintainable test setup
const createMockUrl = (domain = 'example.com', path = 'article') =>
  `https://${domain}/${path}`

const createMockContent = (title = 'Test Article', content = 'Content') =>
  `<html><body><h1>${title}</h1><p>${content}</p></body></html>`

const createMockProcessedContent = (overrides = {}) => ({
  title: 'Test Article',
  content: createMockContent(),
  wordCount: 10,
  contentHash: 'hash123',
  siteName: 'example.com',
  itemType: 'article' as const,
  language: 'en',
  directionality: 'ltr' as const,
  ...overrides,
})

describe('ContentProcessingService', () => {
  let contentProcessingService: ContentProcessingService
  let mockValidationService: jest.Mocked<ContentValidationService>
  let mockCacheService: jest.Mocked<ContentCacheService>
  let mockEnrichmentService: jest.Mocked<ContentEnrichmentService>
  let mockExtractionService: jest.Mocked<ContentExtractionService>

  beforeEach(() => {
    // Clear all mocks before each test for isolation
    jest.clearAllMocks()

    // Create mocked instances using Jest's mocked helper
    mockValidationService = jest.mocked(new ContentValidationService())
    mockCacheService = jest.mocked(new ContentCacheService())
    mockEnrichmentService = jest.mocked(new ContentEnrichmentService())
    mockExtractionService = jest.mocked(new ContentExtractionService())

    // Create service with mocked dependencies
    contentProcessingService = new ContentProcessingService(
      mockValidationService,
      mockCacheService,
      mockEnrichmentService,
      mockExtractionService
    )
  })

  describe('processContent', () => {
    // Helper function to setup successful processing mocks
    const setupSuccessfulProcessingMocks = (url: string, extractedContent: any, enrichedContent?: any) => {
      mockValidationService.validateUrl.mockResolvedValue({
        isValid: true,
        normalizedUrl: url,
      })
      mockCacheService.get.mockResolvedValue(null)
      mockExtractionService.extractContent.mockResolvedValue(extractedContent)
      mockEnrichmentService.enrichContent.mockResolvedValue(enrichedContent || extractedContent)
      mockCacheService.set.mockResolvedValue(undefined)
    }

    test('should process content successfully with all services', async () => {
      // Arrange
      const mockUrl = createMockUrl()
      const extractedContent = createMockProcessedContent()
      const enrichedContent = createMockProcessedContent({
        author: 'Test Author',
        publishedAt: new Date(),
        description: 'Test description',
      })

      setupSuccessfulProcessingMocks(mockUrl, extractedContent, enrichedContent)

      // Act
      const result = await contentProcessingService.processContent(mockUrl, 'HTML')

      // Assert
      expect(mockValidationService.validateUrl).toHaveBeenCalledWith(mockUrl)
      expect(mockCacheService.get).toHaveBeenCalledWith(mockUrl)
      expect(mockExtractionService.extractContent).toHaveBeenCalledWith(mockUrl, 'HTML')
      expect(mockEnrichmentService.enrichContent).toHaveBeenCalledWith(extractedContent)
      expect(mockCacheService.set).toHaveBeenCalledWith(mockUrl, enrichedContent)

      expect(result).toEqual(enrichedContent)
      expect(result.title).toBe('Test Article')
      expect(result.author).toBe('Test Author')
    })

    test('should return cached content when available', async () => {
      // Arrange
      const mockUrl = createMockUrl()
      const cachedResult = createMockProcessedContent({
        title: 'Cached Article',
        contentHash: 'cached-hash',
      })

      mockValidationService.validateUrl.mockResolvedValue({
        isValid: true,
        normalizedUrl: mockUrl,
      })
      mockCacheService.get.mockResolvedValue(cachedResult)

      // Act
      const result = await contentProcessingService.processContent(mockUrl, 'HTML')

      // Assert - should skip extraction and enrichment when cached
      expect(mockValidationService.validateUrl).toHaveBeenCalledWith(mockUrl)
      expect(mockCacheService.get).toHaveBeenCalledWith(mockUrl)
      expect(mockExtractionService.extractContent).not.toHaveBeenCalled()
      expect(mockEnrichmentService.enrichContent).not.toHaveBeenCalled()
      expect(result).toEqual(cachedResult)
    })

    test('should handle validation failures', async () => {
      // Setup mocks
      mockValidationService.validateUrl.mockResolvedValue({
        isValid: false,
        error: 'Invalid URL format',
        normalizedUrl: mockUrl,
      })

      // Execute & Verify
      await expect(
        contentProcessingService.processContent('invalid-url', 'HTML')
      ).rejects.toThrow('Invalid URL format')

      expect(mockValidationService.validateUrl).toHaveBeenCalledWith(
        'invalid-url'
      )
      expect(mockCacheService.get).not.toHaveBeenCalled()
      expect(mockExtractionService.extractContent).not.toHaveBeenCalled()
    })

    test('should handle extraction failures gracefully', async () => {
      // Setup mocks
      mockValidationService.validateUrl.mockResolvedValue({
        isValid: true,
        normalizedUrl: mockUrl,
      })
      mockCacheService.get.mockResolvedValue(null)
      mockExtractionService.extractContent.mockRejectedValue(
        new Error('Extraction failed')
      )

      // Execute & Verify
      await expect(
        contentProcessingService.processContent(mockUrl, 'HTML')
      ).rejects.toThrow('Extraction failed')

      expect(mockValidationService.validateUrl).toHaveBeenCalledWith(mockUrl)
      expect(mockCacheService.get).toHaveBeenCalledWith(mockUrl)
      expect(mockExtractionService.extractContent).toHaveBeenCalledWith(
        mockUrl,
        'HTML'
      )
      expect(mockEnrichmentService.enrichContent).not.toHaveBeenCalled()
    })

    test('should continue processing if enrichment fails', async () => {
      const extractedContent = {
        title: 'Test Article',
        content: mockContent,
        wordCount: 10,
        contentHash: 'hash123',
        siteName: 'example.com',
        itemType: 'article',
        language: 'en',
        directionality: 'ltr',
      }

      // Setup mocks
      mockValidationService.validateUrl.mockResolvedValue({
        isValid: true,
        normalizedUrl: mockUrl,
      })
      mockCacheService.get.mockResolvedValue(null)
      mockExtractionService.extractContent.mockResolvedValue(extractedContent)
      mockEnrichmentService.enrichContent.mockRejectedValue(
        new Error('Enrichment failed')
      )
      mockCacheService.set.mockResolvedValue(undefined)

      // Execute
      const result = await contentProcessingService.processContent(
        mockUrl,
        'HTML'
      )

      // Verify - should return extracted content without enrichment
      expect(result).toEqual(extractedContent)
      expect(mockCacheService.set).toHaveBeenCalledWith(
        mockUrl,
        extractedContent
      )
    })
  })

  describe('performance', () => {
    test('should process content within reasonable time limits', async () => {
      const mockUrl = 'https://example.com/performance-test'

      // Setup mocks with slight delays to simulate real processing
      mockValidationService.validateUrl.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ isValid: true, normalizedUrl: mockUrl }),
              10
            )
          )
      )
      mockCacheService.get.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 5))
      )
      mockExtractionService.extractContent.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  title: 'Performance Test',
                  content: '<p>Content</p>',
                  wordCount: 1,
                  contentHash: 'perf-hash',
                  siteName: 'example.com',
                  itemType: 'article',
                  language: 'en',
                  directionality: 'ltr',
                }),
              50
            )
          )
      )
      mockEnrichmentService.enrichContent.mockImplementation(
        (content) =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ...content,
                  author: 'Performance Author',
                }),
              20
            )
          )
      )
      mockCacheService.set.mockResolvedValue(undefined)

      const startTime = Date.now()
      const result = await contentProcessingService.processContent(
        mockUrl,
        'HTML'
      )
      const endTime = Date.now()

      // Should complete within reasonable time (under 200ms for this mock scenario)
      expect(endTime - startTime).toBeLessThan(200)
      expect(result).toBeDefined()
      expect(result.title).toBe('Performance Test')
    })
  })
})
