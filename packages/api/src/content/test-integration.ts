/**
 * Integration Test for Unified Content Processing System
 *
 * Comprehensive test to validate the complete content processing pipeline
 */

import { logger } from '../utils/logger'
import { ContentType } from '../events/content/content-save-event'
import { UnifiedContentProcessor } from './index'

interface TestCase {
  name: string
  url: string
  expectedContentType: ContentType
  shouldSucceed: boolean
  expectedFeatures?: string[]
}

const testCases: TestCase[] = [
  {
    name: 'Simple HTML Article',
    url: 'https://example.com/article',
    expectedContentType: ContentType.HTML,
    shouldSucceed: true,
    expectedFeatures: ['title', 'content', 'wordCount'],
  },
  {
    name: 'Medium Article',
    url: 'https://medium.com/@author/article-title',
    expectedContentType: ContentType.HTML,
    shouldSucceed: true,
    expectedFeatures: ['title', 'author', 'content', 'siteName'],
  },
  {
    name: 'Substack Newsletter',
    url: 'https://newsletter.substack.com/p/post-title',
    expectedContentType: ContentType.HTML,
    shouldSucceed: true,
    expectedFeatures: ['title', 'author', 'content', 'isNewsletter'],
  },
  {
    name: 'Twitter/X Post',
    url: 'https://twitter.com/user/status/123456789',
    expectedContentType: ContentType.HTML,
    shouldSucceed: true,
    expectedFeatures: ['title', 'author', 'content', 'platform'],
  },
  {
    name: 'YouTube Video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    expectedContentType: ContentType.YOUTUBE,
    shouldSucceed: true,
    expectedFeatures: ['title', 'author', 'siteName', 'videoId'],
  },
  {
    name: 'GitHub Repository',
    url: 'https://github.com/user/repo',
    expectedContentType: ContentType.HTML,
    shouldSucceed: true,
    expectedFeatures: ['title', 'content', 'platform'],
  },
  {
    name: 'PDF Document',
    url: 'https://example.com/document.pdf',
    expectedContentType: ContentType.PDF,
    shouldSucceed: true,
    expectedFeatures: ['title', 'content', 'itemType'],
  },
  {
    name: 'RSS Feed Item',
    url: 'https://example.com/feed.xml',
    expectedContentType: ContentType.RSS,
    shouldSucceed: true,
    expectedFeatures: ['title', 'content', 'siteName'],
  },
  {
    name: 'Invalid URL',
    url: 'not-a-url',
    expectedContentType: ContentType.HTML,
    shouldSucceed: false,
  },
  {
    name: 'Blocked Domain',
    url: 'https://localhost/private',
    expectedContentType: ContentType.HTML,
    shouldSucceed: false,
  },
]

async function runIntegrationTests(): Promise<void> {
  logger.info('Starting unified content processing integration tests')

  const processor = new UnifiedContentProcessor()
  let passed = 0
  let failed = 0

  for (const testCase of testCases) {
    logger.info(`Running test: ${testCase.name}`)

    try {
      const startTime = Date.now()

      const result = await processor.processContent(
        testCase.url,
        testCase.expectedContentType,
        {
          timeout: 10000, // Short timeout for tests
          enableJavaScript: false, // Disable JS for faster tests
        }
      )

      const duration = Date.now() - startTime

      if (testCase.shouldSucceed) {
        // Validate result structure
        if (!result.content) {
          throw new Error('No content extracted')
        }

        // Check expected features
        if (testCase.expectedFeatures) {
          for (const feature of testCase.expectedFeatures) {
            if (
              !(feature in result) ||
              !result[feature as keyof typeof result]
            ) {
              logger.warn(`Missing expected feature: ${feature}`, { result })
            }
          }
        }

        logger.info(`✅ Test passed: ${testCase.name}`, {
          duration,
          title: result.title,
          wordCount: result.wordCount,
          hasAuthor: !!result.author,
          siteName: result.siteName,
        })
        passed++
      } else {
        logger.error(`❌ Test should have failed: ${testCase.name}`)
        failed++
      }
    } catch (error) {
      if (testCase.shouldSucceed) {
        logger.error(`❌ Test failed: ${testCase.name}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        failed++
      } else {
        logger.info(`✅ Test correctly failed: ${testCase.name}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        passed++
      }
    }
  }

  // Test service capabilities
  logger.info('Testing service capabilities')

  try {
    const stats = processor.getStats()
    logger.info('Service statistics', stats)

    const capabilities = processor.getCapabilities()
    logger.info('Service capabilities', capabilities)

    logger.info('✅ Service capability tests passed')
    passed++
  } catch (error) {
    logger.error('❌ Service capability tests failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    failed++
  }

  // Cleanup
  try {
    await processor.cleanup()
    logger.info('✅ Cleanup successful')
  } catch (error) {
    logger.error('❌ Cleanup failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  // Summary
  logger.info('Integration test summary', {
    total: testCases.length + 1, // +1 for capability test
    passed,
    failed,
    successRate: `${Math.round((passed / (passed + failed)) * 100)}%`,
  })

  if (failed > 0) {
    throw new Error(`${failed} tests failed`)
  }

  logger.info('🎉 All integration tests passed!')
}

// Export for use in other test files
export { runIntegrationTests, testCases }

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests()
    .then(() => {
      logger.info('Integration tests completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('Integration tests failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      process.exit(1)
    })
}
