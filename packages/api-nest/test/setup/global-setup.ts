import { setupTestContainer } from './testcontainers'
import { TEST_DB_ENV_VARS } from './test-db-constants'

/**
 * Jest Global Setup
 * Runs once before all test suites
 * Starts PostgreSQL container and initializes database
 */
export default async function globalSetup() {
  console.log('\n🚀 Jest Global Setup - Starting test infrastructure...\n')

  try {
    // Validate environment before starting
    if (process.env.NODE_ENV && process.env.NODE_ENV !== 'test') {
      console.warn(
        `\n⚠️  WARNING: NODE_ENV is "${process.env.NODE_ENV}" but should be "test".\n` +
          `   E2E tests expect NODE_ENV=test for library compatibility.\n` +
          `   Setting NODE_ENV=test now...\n`,
      )
    }

    // Set NODE_ENV to test FIRST so ConfigModule loads .env.test
    process.env.NODE_ENV = 'test'
    console.log('✅ Environment: NODE_ENV=test (E2E test mode)')

    // Start container and initialize database
    const { container, dataSource } = await setupTestContainer()

    // Store connection details in environment variables for test workers
    // Using TEST_DATABASE_* naming (from TEST_DB_ENV_VARS constants)
    process.env[TEST_DB_ENV_VARS.HOST] = container.getHost()
    process.env[TEST_DB_ENV_VARS.PORT] = container.getPort().toString()
    process.env[TEST_DB_ENV_VARS.NAME] = container.getDatabase()
    process.env[TEST_DB_ENV_VARS.USER] = container.getUsername()
    process.env[TEST_DB_ENV_VARS.PASSWORD] = container.getPassword()

    console.log('\n🔧 Test database connection:')
    console.log(`   Host: ${container.getHost()}`)
    console.log(`   Port: ${container.getPort()}`)
    console.log(`   Database: ${container.getDatabase()}`)
    console.log(`   User: ${container.getUsername()}\n`)

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
