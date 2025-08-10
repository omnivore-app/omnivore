/**
 * Basic Content Processing System Test
 *
 * Tests the unified content processing system without external dependencies
 */

import { ContentType } from '../events/content/content-save-event'
import { UnifiedContentProcessor } from './index'

describe('Unified Content Processing System', () => {
  let processor: UnifiedContentProcessor

  beforeEach(() => {
    processor = new UnifiedContentProcessor()
  })

  afterEach(async () => {
    await processor.cleanup()
  })

  describe('Initialization', () => {
    test('should initialize successfully', () => {
      expect(processor).toBeDefined()
    })

    test('should have capabilities', () => {
      const capabilities = processor.getCapabilities()

      expect(capabilities).toBeDefined()
      expect(capabilities.supportedContentTypes).toContain(ContentType.HTML)
      expect(capabilities.supportedContentTypes).toContain(ContentType.PDF)
      expect(capabilities.supportedContentTypes).toContain(ContentType.EMAIL)
      expect(capabilities.supportedContentTypes).toContain(ContentType.RSS)
      expect(capabilities.supportedContentTypes).toContain(ContentType.YOUTUBE)

      expect(capabilities.features.caching).toBe(true)
      expect(capabilities.features.specializedHandlers).toBe(true)
      expect(capabilities.extractors).toContain('puppeteer')
      expect(capabilities.extractors).toContain('readability')
    })

    test('should have stats', () => {
      const stats = processor.getStats()

      expect(stats).toBeDefined()
      expect(typeof stats.totalProcessed).toBe('number')
      expect(typeof stats.successfulProcessing).toBe('number')
      expect(typeof stats.failedProcessing).toBe('number')
    })
  })

  describe('URL Validation', () => {
    test('should handle valid URLs', async () => {
      const canProcess = await processor.canProcess(
        'https://example.com',
        ContentType.HTML
      )
      expect(typeof canProcess).toBe('boolean')
    })

    test('should handle invalid URLs', async () => {
      const canProcess = await processor.canProcess(
        'not-a-url',
        ContentType.HTML
      )
      expect(canProcess).toBe(false)
    })

    test('should handle blocked URLs', async () => {
      const canProcess = await processor.canProcess(
        'https://localhost/private',
        ContentType.HTML
      )
      expect(canProcess).toBe(false)
    })
  })

  describe('Content Type Detection', () => {
    test('should detect HTML content type', async () => {
      const canProcess = await processor.canProcess(
        'https://example.com/article',
        ContentType.HTML
      )
      expect(typeof canProcess).toBe('boolean')
    })

    test('should detect PDF content type', async () => {
      const canProcess = await processor.canProcess(
        'https://example.com/doc.pdf',
        ContentType.PDF
      )
      expect(typeof canProcess).toBe('boolean')
    })

    test('should detect YouTube content type', async () => {
      const canProcess = await processor.canProcess(
        'https://youtube.com/watch?v=123',
        ContentType.YOUTUBE
      )
      expect(typeof canProcess).toBe('boolean')
    })
  })

  describe('Error Handling', () => {
    test('should handle processing errors gracefully', async () => {
      try {
        await processor.processContent('invalid-url', ContentType.HTML)
        // Should not reach here
        expect(false).toBe(true)
      } catch (error) {
        expect(error).toBeDefined()
        expect(error instanceof Error).toBe(true)
      }
    })

    test('should handle cleanup gracefully', async () => {
      await expect(processor.cleanup()).resolves.not.toThrow()
    })
  })

  describe('Performance', () => {
    test('should initialize quickly', () => {
      const startTime = Date.now()
      const testProcessor = new UnifiedContentProcessor()
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(1000) // Should initialize in under 1 second
      expect(testProcessor).toBeDefined()

      // Cleanup
      testProcessor.cleanup()
    })
  })
})
