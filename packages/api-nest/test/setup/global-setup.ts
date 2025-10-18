import { setupTestContainer } from './testcontainers'

/**
 * Jest Global Setup
 * Runs once before all test suites
 * Starts PostgreSQL container and initializes database
 */
export default async function globalSetup() {
  console.log('\n🚀 Jest Global Setup - Starting test infrastructure...\n')

  try {
    // Start container and initialize database
    const { container, dataSource } = await setupTestContainer()

    // Store connection details in environment variables for test workers
    process.env.TEST_DB_HOST = container.getHost()
    process.env.TEST_DB_PORT = container.getPort().toString()
    process.env.TEST_DB_DATABASE = container.getDatabase()
    process.env.TEST_DB_USERNAME = container.getUsername()
    process.env.TEST_DB_PASSWORD = container.getPassword()

    // Store for global teardown
    // @ts-ignore - globalThis extension
    globalThis.__TEST_CONTAINER__ = container
    // @ts-ignore
    globalThis.__TEST_DATASOURCE__ = dataSource

    console.log('\n✅ Global setup complete!\n')
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}
