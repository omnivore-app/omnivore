#!/usr/bin/env node
/**
 * Integration Test Runner for Unified Content Processing System
 *
 * This script tests the complete content processing pipeline with real URLs
 * Run with: npx tsx src/content/integration-test-runner.ts
 */

import { logger } from '../utils/logger'
import { ContentType } from '../events/content/content-save-event'
import { UnifiedContentProcessor } from './index'

interface TestCase {
  name: string
  url: string
  contentType: ContentType
  expectedFeatures: string[]
  timeout?: number
}

const testCases: TestCase[] = [
  {
    name: 'Simple HTML Page',
    url: 'https://example.com',
    contentType: ContentType.HTML,
    expectedFeatures: ['title', 'content'],
    timeout: 15000,
  },
  {
    name: 'GitHub Repository',
    url: 'https://github.com/microsoft/vscode',
    contentType: ContentType.HTML,
    expectedFeatures: ['title', 'content'],
    timeout: 20000,
  },
  {
    name: 'Wikipedia Article',
    url: 'https://en.wikipedia.org/wiki/Node.js',
    contentType: ContentType.HTML,
    expectedFeatures: ['title', 'content', 'wordCount'],
    timeout: 20000,
  },
]

async function runIntegrationTest(
  testCase: TestCase,
  processor: UnifiedContentProcessor
): Promise<boolean> {
  logger.info(`🧪 Testing: ${testCase.name}`)
  logger.info(`📍 URL: ${testCase.url}`)

  const startTime = Date.now()

  try {
    // Test if we can process this URL
    const canProcess = await processor.canProcess(
      testCase.url,
      testCase.contentType
    )

    if (!canProcess) {
      logger.warn(`⚠️  URL cannot be processed: ${testCase.url}`)
      return false
    }

    logger.info(`✅ URL validation passed`)

    // Process the content
    const result = await processor.processContent(
      testCase.url,
      testCase.contentType,
      {
        timeout: testCase.timeout || 30000,
        enableJavaScript: false, // Keep it simple for testing
      }
    )

    const processingTime = Date.now() - startTime

    // Validate the result
    if (!result.content || result.content.length === 0) {
      logger.error(`❌ No content extracted from: ${testCase.url}`)
      return false
    }

    // Check expected features
    const missingFeatures = testCase.expectedFeatures.filter((feature) => {
      const value = (result as any)[feature]
      return !value || (typeof value === 'string' && value.trim().length === 0)
    })

    if (missingFeatures.length > 0) {
      logger.warn(
        `⚠️  Missing expected features: ${missingFeatures.join(', ')}`
      )
    }

    // Log results
    logger.info(`✅ Test passed: ${testCase.name}`, {
      processingTime: `${processingTime}ms`,
      title: result.title || 'No title',
      contentLength: result.content.length,
      wordCount: result.wordCount || 0,
      author: result.author || 'No author',
      siteName: result.siteName || 'No site name',
      hasDescription: !!result.description,
      hasThumbnail: !!result.thumbnail,
      language: result.language || 'Unknown',
    })

    return true
  } catch (error) {
    const processingTime = Date.now() - startTime

    logger.error(`❌ Test failed: ${testCase.name}`, {
      processingTime: `${processingTime}ms`,
      url: testCase.url,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return false
  }
}

async function main() {
  logger.info('🚀 Starting Unified Content Processing Integration Tests')

  const processor = new UnifiedContentProcessor()
  let passed = 0
  let failed = 0

  // Show system capabilities
  const capabilities = processor.getCapabilities()
  logger.info('📋 System Capabilities:', capabilities)

  // Run tests
  for (const testCase of testCases) {
    logger.info(`\n${'='.repeat(60)}`)

    const success = await runIntegrationTest(testCase, processor)

    if (success) {
      passed++
    } else {
      failed++
    }

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Show final stats
  const stats = processor.getStats()
  logger.info('\n📊 Final Statistics:', stats)

  // Cleanup
  await processor.cleanup()

  // Summary
  logger.info(`\n${'='.repeat(60)}`)
  logger.info('📈 Test Summary:', {
    total: testCases.length,
    passed,
    failed,
    successRate: `${Math.round((passed / testCases.length) * 100)}%`,
  })

  if (failed === 0) {
    logger.info('🎉 All integration tests passed!')
    process.exit(0)
  } else {
    logger.error(`💥 ${failed} test(s) failed`)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// Run the tests
if (require.main === module) {
  main().catch((error) => {
    logger.error('💥 Integration test runner failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    process.exit(1)
  })
}
