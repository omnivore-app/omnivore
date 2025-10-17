import { DataSource } from 'typeorm'
import { testDatabaseConfig } from '../../src/config/test.config'

/**
 * Test Database Setup Utility
 *
 * Provides utilities for managing test database lifecycle:
 * - Creating test database before tests
 * - Cleaning up test database after tests
 * - Ensuring database isolation
 */

/**
 * Creates a PostgreSQL connection to the default 'postgres' database
 * Used to create/drop test databases
 */
async function getAdminConnection(): Promise<DataSource> {
  const adminConfig = {
    ...testDatabaseConfig,
    database: 'postgres', // Connect to default postgres database
  }

  // Remove TypeORM-specific options that DataSource doesn't use
  const { entities, synchronize, logging, ...connectionOptions } = adminConfig as any

  const dataSource = new DataSource(connectionOptions as any)
  await dataSource.initialize()
  return dataSource
}

/**
 * Creates the test database if it doesn't exist
 * This should be run before test suite starts
 */
export async function createTestDatabase(): Promise<void> {
  const testDbName = testDatabaseConfig.database as string

  console.log(`\n🔧 Setting up test database: ${testDbName}`)

  let adminConnection: DataSource | null = null

  try {
    adminConnection = await getAdminConnection()

    // Check if database exists
    const result = await adminConnection.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [testDbName]
    )

    if (result.length === 0) {
      // Database doesn't exist, create it
      await adminConnection.query(`CREATE DATABASE ${testDbName}`)
      console.log(`✅ Created test database: ${testDbName}`)
    } else {
      console.log(`ℹ️  Test database already exists: ${testDbName}`)
    }
  } catch (error) {
    console.error(`❌ Failed to create test database:`, error)
    throw error
  } finally {
    if (adminConnection) {
      await adminConnection.destroy()
    }
  }
}

/**
 * Drops the test database completely
 * WARNING: This will delete ALL test data
 * This should be run after test suite completes
 */
export async function dropTestDatabase(): Promise<void> {
  const testDbName = testDatabaseConfig.database as string

  console.log(`\n🧹 Cleaning up test database: ${testDbName}`)

  let adminConnection: DataSource | null = null

  try {
    adminConnection = await getAdminConnection()

    // Terminate all active connections to the test database
    await adminConnection.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()
    `, [testDbName])

    // Drop the database
    await adminConnection.query(`DROP DATABASE IF EXISTS ${testDbName}`)
    console.log(`✅ Dropped test database: ${testDbName}`)
  } catch (error) {
    console.error(`❌ Failed to drop test database:`, error)
    // Don't throw - cleanup failures shouldn't fail tests
  } finally {
    if (adminConnection) {
      await adminConnection.destroy()
    }
  }
}

/**
 * Truncates all tables in the test database
 * Faster than dropping/recreating for between-test cleanup
 */
export async function cleanTestDatabase(): Promise<void> {
  const testDbName = testDatabaseConfig.database as string

  let testConnection: DataSource | null = null

  try {
    const { entities, synchronize, logging, ...connectionOptions } = testDatabaseConfig as any
    testConnection = new DataSource(connectionOptions as any)
    await testConnection.initialize()

    // Get all table names from omnivore schema
    const tables = await testConnection.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'omnivore'
    `)

    if (tables.length > 0) {
      const tableNames = tables.map((t: any) => `omnivore.${t.tablename}`).join(', ')

      // Truncate all tables with CASCADE to handle foreign keys
      await testConnection.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`)

      console.log(`✅ Cleaned ${tables.length} tables in test database`)
    }
  } catch (error) {
    console.error(`❌ Failed to clean test database:`, error)
    throw error
  } finally {
    if (testConnection) {
      await testConnection.destroy()
    }
  }
}

/**
 * Ensures test database exists and runs migrations
 * Call this in your test setup (e.g., jest globalSetup)
 */
export async function setupTestDatabase(): Promise<void> {
  await createTestDatabase()

  // Note: Migrations should be run separately using the migration script
  // This is to ensure the test database schema matches production
  console.log(`\n⚠️  Remember to run migrations on test database:`)
  console.log(`   TEST_DATABASE_NAME=omnivore_test npm run migration:run\n`)
}

/**
 * Tears down test database
 * Call this in your test teardown (e.g., jest globalTeardown)
 */
export async function teardownTestDatabase(): Promise<void> {
  // Option 1: Drop entire database (clean slate for next run)
  // await dropTestDatabase()

  // Option 2: Just clean tables (faster, keeps schema)
  await cleanTestDatabase()
}
