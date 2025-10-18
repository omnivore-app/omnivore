import { teardownTestContainer } from './testcontainers'

/**
 * Jest Global Teardown
 * Runs once after all test suites complete
 * Stops PostgreSQL container and cleans up resources
 */
export default async function globalTeardown() {
  console.log('\n🧹 Jest Global Teardown - Cleaning up test infrastructure...\n')

  try {
    await teardownTestContainer()

    // Clean up global reference
    // @ts-ignore - globalThis extension
    delete globalThis.__TEST_DATASOURCE__

    console.log('\n✅ Global teardown complete!\n')
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw - let tests complete even if cleanup fails
  }
}
