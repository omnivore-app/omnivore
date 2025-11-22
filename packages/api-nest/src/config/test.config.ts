import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'
import { User } from '../user/entities/user.entity'
import { UserProfile } from '../user/entities/profile.entity'
import { UserPersonalization } from '../user/entities/user-personalization.entity'
import { Filter } from '../filter/entities/filter.entity'
import { Group } from '../group/entities/group.entity'
import { Invite } from '../group/entities/invite.entity'
import { GroupMembership } from '../group/entities/group-membership.entity'
import { LibraryItemEntity } from '../library/entities/library-item.entity'
import { Label } from '../label/entities/label.entity'
import { EntityLabel } from '../label/entities/entity-label.entity'
import { HighlightEntity } from '../highlight/entities/highlight.entity'
import { ReadingProgressEntity } from '../reading-progress/entities/reading-progress.entity'

/**
 * Validates test database configuration to prevent accidental production DB connections
 * @param dbName - The database name to validate
 * @returns The validated database name
 * @throws Error if attempting to connect to production database or if name is missing
 */
function validateTestDatabaseName(dbName: string | undefined): string {
  // Production database names that must never be used in tests
  const FORBIDDEN_DB_NAMES = [
    'omnivore',            // Main production DB
    'omnivore_prod',       // Production variant
    'omnivore_production', // Production variant
  ]

  // If no database name provided, throw error
  if (!dbName) {
    throw new Error(
      '🚨 CRITICAL: TEST_DATABASE_NAME is not set!\n' +
      'Tests cannot run without a database configuration.\n\n' +
      'For E2E tests with testcontainers (recommended):\n' +
      '  - This should be set automatically by global-setup.ts\n' +
      '  - Check that Jest globalSetup is configured correctly in jest-e2e.json\n\n' +
      'For manual test database:\n' +
      '  - Copy .env.test.example to .env.test\n' +
      '  - Set TEST_DATABASE_NAME=omnivore_test\n' +
      '  - Create database: psql -U postgres -c "CREATE DATABASE omnivore_test;"\n' +
      '  - Run migrations: TEST_DATABASE_NAME=omnivore_test npm run migration:run\n'
    )
  }

  // Block production database names
  const normalizedDbName = dbName.toLowerCase()
  if (FORBIDDEN_DB_NAMES.includes(normalizedDbName)) {
    throw new Error(
      `🚨 CRITICAL: Tests attempting to connect to PRODUCTION database "${dbName}"!\n\n` +
      `This would corrupt production data. Tests have been BLOCKED.\n\n` +
      `Use a dedicated test database instead:\n` +
      `  - For testcontainers: Global setup handles this automatically\n` +
      `  - For manual DB: Set TEST_DATABASE_NAME=omnivore_test in .env.test\n\n` +
      `Forbidden database names: ${FORBIDDEN_DB_NAMES.join(', ')}`
    )
  }

  // Warn if database name doesn't contain 'test' (suspicious but not blocked)
  if (!normalizedDbName.includes('test')) {
    console.warn(
      `⚠️  WARNING: Test database name "${dbName}" doesn't contain "test".\n` +
      `   This might not be a dedicated test database. Recommended: omnivore_test\n`
    )
  }

  return dbName
}

/**
 * Test database configuration for E2E tests
 * Supports two modes:
 * 1. Testcontainers (default): Ephemeral PostgreSQL container, auto-configured by global-setup.ts
 * 2. Manual DB: Static test database specified in .env.test file
 */
const getTestDatabaseConfig = (): TypeOrmModuleOptions => {
  const host = process.env.TEST_DATABASE_HOST || 'localhost'
  const port = Number.parseInt(process.env.TEST_DATABASE_PORT || '5432')
  const username = process.env.TEST_DATABASE_USER || 'postgres'
  const password = process.env.TEST_DATABASE_PASSWORD || ''
  const database = validateTestDatabaseName(process.env.TEST_DATABASE_NAME)

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
  entities: [
    User,
    UserProfile,
    UserPersonalization,
    Filter,
    Group,
    Invite,
    GroupMembership,
    LibraryItemEntity,
    Label,
    EntityLabel,
    HighlightEntity,
    ReadingProgressEntity,
  ],
  synchronize: false, // Schema managed by migrations
  logging: false,     // Reduce test noise
  }
}

export const testDatabaseConfig = getTestDatabaseConfig()

export const createTestDataSource = () => {
  return new DataSource(testDatabaseConfig as DataSourceOptions)
}
