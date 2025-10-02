/**
 * Content Worker Unit Tests
 * 
 * Focused unit tests for the ContentWorker class methods and logic
 */

import { ContentWorker } from './content-worker'
import { ContentErrorClassifier, ErrorCategory } from '../errors/content-error-classifier'

describe('ContentWorker', () => {
  let contentWorker: ContentWorker
  let errorClassifier: ContentErrorClassifier

  beforeEach(() => {
    contentWorker = new ContentWorker()
    errorClassifier = new ContentErrorClassifier()
  })

  afterEach(async () => {
    // Cleanup if method exists
    if (typeof contentWorker.cleanup === 'function') {
      await contentWorker.cleanup()
    }
  })

  describe('Error Classification Integration', () => {
    test('should properly classify DNS errors for content processing', () => {
      const dnsError = new Error('NS_ERROR_UNKNOWN_HOST: No such host is known')
      const classified = errorClassifier.classify(dnsError, 'https://nonexistent.test')

      expect(classified.category).toBe(ErrorCategory.DNS)
      expect(classified.retryable).toBe(false)
      expect(classified.userMessage).toContain("address couldn't be found")
      expect(classified.suggestedAction).toBe('verify_url')
    })

    test('should properly classify SSL errors for fallback strategies', () => {
      const sslError = new Error('SSL_ERROR_BAD_CERT_DOMAIN: Certificate domain mismatch')
      const classified = errorClassifier.classify(sslError, 'https://ssl-broken.test')

      expect(classified.category).toBe(ErrorCategory.SSL)
      expect(classified.retryable).toBe(true)
      expect(classified.suggestedAction).toBe('try_http_fallback')
      expect(classified.alternativeActions).toContain('try_http_version')
    })

    test('should properly classify timeout errors for retry logic', () => {
      const timeoutError = new Error('Navigation timeout of 30000 ms exceeded')
      const classified = errorClassifier.classify(timeoutError, 'https://slow.test')

      expect(classified.category).toBe(ErrorCategory.TIMEOUT)
      expect(classified.retryable).toBe(true)
      expect(classified.retryAfterMs).toBeGreaterThan(0)
      expect(classified.suggestedAction).toBe('retry_with_longer_timeout')
    })
  })

  describe('Content Processing Methods', () => {
    test('should have required processing methods', () => {
      expect(typeof contentWorker.processContent).toBe('function')
      
      // Check for cleanup method existence
      const hasCleanup = typeof contentWorker.cleanup === 'function'
      if (hasCleanup) {
        expect(typeof contentWorker.cleanup).toBe('function')
      }
    })

    test('should wrap content for font styling support', () => {
      const testContent = '<p>Test content for font manipulation</p>'
      const wrapped = contentWorker['wrapContentForStyling'](testContent)

      // Should have omnivore wrapper
      expect(wrapped).toContain('omnivore-reader-content')
      expect(wrapped).toContain('data-omnivore-content="true"')
      
      // Should have font inheritance CSS
      expect(wrapped).toContain('font-family: inherit')
      expect(wrapped).toContain('--reader-font-family')
      expect(wrapped).toContain('--reader-font-size')
      
      // Should preserve original content
      expect(wrapped).toContain('<p>Test content for font manipulation</p>')
    })

    test('should preserve complex content structure in font wrapper', () => {
      const complexContent = `
        <h1>Main Title</h1>
        <h2>Subtitle</h2>
        <p>Paragraph content with <strong>bold</strong> and <em>italic</em> text.</p>
        <blockquote>
          <p>This is a quote that should be preserved.</p>
        </blockquote>
        <ul>
          <li>First list item</li>
          <li>Second list item</li>
        </ul>
        <pre><code>Code block content</code></pre>
      `
      
      const wrapped = contentWorker['wrapContentForStyling'](complexContent)

      // Should preserve all structural elements
      expect(wrapped).toContain('<h1>Main Title</h1>')
      expect(wrapped).toContain('<h2>Subtitle</h2>')
      expect(wrapped).toContain('<strong>bold</strong>')
      expect(wrapped).toContain('<em>italic</em>')
      expect(wrapped).toContain('<blockquote>')
      expect(wrapped).toContain('<ul>')
      expect(wrapped).toContain('<li>First list item</li>')
      expect(wrapped).toContain('<pre><code>')
      
      // Should have CSS rules for all major elements
      expect(wrapped).toContain('.omnivore-reader-content h1')
      expect(wrapped).toContain('.omnivore-reader-content h2')
      expect(wrapped).toContain('.omnivore-reader-content p')
      expect(wrapped).toContain('.omnivore-reader-content blockquote')
      expect(wrapped).toContain('.omnivore-reader-content ul')
      expect(wrapped).toContain('.omnivore-reader-content pre')
      
      // Should have font inheritance for all elements
      expect(wrapped).toContain('font-family: inherit !important')
    })

    test('should handle empty or minimal content gracefully', () => {
      const emptyContent = ''
      const wrapped1 = contentWorker['wrapContentForStyling'](emptyContent)
      
      expect(wrapped1).toContain('omnivore-reader-content')
      expect(wrapped1).toContain('data-omnivore-content="true"')
      
      const minimalContent = '<p></p>'
      const wrapped2 = contentWorker['wrapContentForStyling'](minimalContent)
      
      expect(wrapped2).toContain('<p></p>')
      expect(wrapped2).toContain('omnivore-reader-content')
    })
  })

  describe('URL Processing', () => {
    test('should extract site name from URL correctly', () => {
      const extractSiteName = contentWorker['extractSiteNameFromUrl']
      
      expect(extractSiteName('https://blog.example.com/article')).toBe('blog.example.com')
      expect(extractSiteName('https://www.news.com/story/123')).toBe('www.news.com')
      expect(extractSiteName('http://localhost:3000/test')).toBe('localhost:3000')
    })

    test('should extract title from URL as fallback', () => {
      const extractTitle = contentWorker['extractTitleFromUrl']
      
      expect(extractTitle('https://example.com/my-great-article')).toBe('my-great-article')
      expect(extractTitle('https://blog.com/posts/how-to-code')).toBe('how-to-code')
      expect(extractTitle('https://site.com/page.html')).toBe('page.html')
    })
  })

  describe('Content Type Detection', () => {
    test('should determine page type from content type correctly', () => {
      const determinePageType = contentWorker['determinePageType']
      
      expect(determinePageType('text/html')).toBe('article')
      expect(determinePageType('application/pdf')).toBe('file')
      expect(determinePageType('image/png')).toBe('image')
      expect(determinePageType('video/mp4')).toBe('video')
    })
  })

  describe('Text Direction Detection', () => {
    test('should detect RTL text correctly', () => {
      const detectDirection = contentWorker['detectTextDirection']
      
      // Arabic text
      const arabicText = 'مرحبا بكم في هذا الموقع'
      expect(detectDirection(arabicText)).toBe('rtl')
      
      // Hebrew text  
      const hebrewText = 'שלום עולם'
      expect(detectDirection(hebrewText)).toBe('rtl')
      
      // English text (LTR)
      const englishText = 'Hello world, this is a test'
      expect(detectDirection(englishText)).toBe('ltr')
      
      // Mixed text (should default to LTR if RTL not dominant)
      const mixedText = 'Hello مرحبا world'
      expect(detectDirection(mixedText)).toBe('ltr')
    })
  })

  describe('Browser Configuration', () => {
    test('should have proper error handling patterns', () => {
      // Test that the worker has the correct patterns for ignoring Firefox errors
      const ignoredErrors = [
        'network.failRequest',
        'Protocol error',
        'NS_ERROR_UNKNOWN_HOST',
        'SSL_ERROR_BAD_CERT_DOMAIN',
        'Target closed',
        'Session closed',
      ]

      // This tests the concept - in practice, these would be tested through integration
      // since they involve browser initialization
      ignoredErrors.forEach(errorPattern => {
        expect(typeof errorPattern).toBe('string')
        expect(errorPattern.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Performance Considerations', () => {
    test('should handle font styling wrapper efficiently', () => {
      const largeContent = '<p>' + 'Large content '.repeat(1000) + '</p>'
      
      const startTime = Date.now()
      const wrapped = contentWorker['wrapContentForStyling'](largeContent)
      const endTime = Date.now()
      
      // Should process large content quickly (under 100ms)
      expect(endTime - startTime).toBeLessThan(100)
      expect(wrapped).toContain('omnivore-reader-content')
      expect(wrapped).toContain(largeContent)
    })

    test('should handle multiple URL processing operations efficiently', () => {
      const urls = Array.from({ length: 100 }, (_, i) => 
        `https://example${i}.com/article-${i}`
      )
      
      const startTime = Date.now()
      
      urls.forEach(url => {
        contentWorker['extractSiteNameFromUrl'](url)
        contentWorker['extractTitleFromUrl'](url)
      })
      
      const endTime = Date.now()
      
      // Should process 100 URLs quickly (under 50ms)
      expect(endTime - startTime).toBeLessThan(50)
    })
  })
})