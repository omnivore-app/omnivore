import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { DataSource } from 'typeorm'
import { User } from '../../src/user/entities/user.entity'
import { UserProfile } from '../../src/user/entities/profile.entity'
import { UserPersonalization } from '../../src/user/entities/user-personalization.entity'
import { Filter } from '../../src/filter/entities/filter.entity'
import { Group } from '../../src/group/entities/group.entity'
import { Invite } from '../../src/group/entities/invite.entity'
import { GroupMembership } from '../../src/group/entities/group-membership.entity'
import { LibraryItemEntity } from '../../src/library/entities/library-item.entity'
import { Label } from '../../src/label/entities/label.entity'
import { EntityLabel } from '../../src/label/entities/entity-label.entity'
import { HighlightEntity } from '../../src/highlight/entities/highlight.entity'

let container: StartedPostgreSqlContainer | null = null
let dataSource: DataSource | null = null

/**
 * Start PostgreSQL container and initialize DataSource with migrations
 * This is called once at the start of the entire test run
 */
export async function setupTestContainer(): Promise<{
  container: StartedPostgreSqlContainer
  dataSource: DataSource
}> {
  console.log('🐳 Starting PostgreSQL test container...')

  // Start PostgreSQL 15 container
  container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('test_omnivore')
    .withUsername('test_user')
    .withPassword('test_password')
    .withExposedPorts(5432)
    .start()

  console.log(`✅ PostgreSQL container started on port ${container.getPort()}`)

  // Create DataSource with all entities
  dataSource = new DataSource({
    type: 'postgres',
    host: container.getHost(),
    port: container.getPort(),
    database: container.getDatabase(),
    username: container.getUsername(),
    password: container.getPassword(),
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
    ],
    synchronize: false, // We'll call synchronize() manually after creating schema
    logging: false, // Disable logging for cleaner test output
    dropSchema: false, // Don't drop schema (we want it to persist across tests)
  })

  console.log('🔌 Initializing database connection...')
  await dataSource.initialize()

  console.log('📁 Creating omnivore schema...')
  // Create the omnivore schema that our entities use
  await dataSource.query('CREATE SCHEMA IF NOT EXISTS omnivore')

  console.log('🔄 Synchronizing database schema...')
  // Now synchronize will create tables in the omnivore schema
  await dataSource.synchronize()

  console.log('✅ Test database ready!')

  return { container, dataSource }
}

/**
 * Stop PostgreSQL container and close DataSource
 * This is called once at the end of the entire test run
 */
export async function teardownTestContainer(): Promise<void> {
  console.log('🧹 Cleaning up test container...')

  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy()
    console.log('✅ DataSource closed')
  }

  if (container) {
    await container.stop()
    console.log('✅ PostgreSQL container stopped')
  }
}

/**
 * Get the current DataSource instance
 * Used by factories and test helpers
 */
export function getTestDataSource(): DataSource {
  if (!dataSource || !dataSource.isInitialized) {
    throw new Error(
      'Test DataSource not initialized. Make sure globalSetup has run.',
    )
  }
  return dataSource
}

/**
 * Begin a transaction for test isolation
 * Call this in beforeEach hooks
 */
export async function beginTestTransaction(): Promise<void> {
  const ds = getTestDataSource()
  await ds.query('BEGIN')
}

/**
 * Rollback transaction to restore database state
 * Call this in afterEach hooks
 */
export async function rollbackTestTransaction(): Promise<void> {
  const ds = getTestDataSource()
  await ds.query('ROLLBACK')
}

/**
 * Clean all tables (alternative to transaction rollback)
 * Useful for E2E tests that need to commit transactions
 */
export async function cleanDatabase(): Promise<void> {
  const ds = getTestDataSource()

  // Disable foreign key checks temporarily
  await ds.query('SET session_replication_role = replica')

  // Truncate all tables
  const tables = [
    'omnivore.entity_label',
    'omnivore.highlight',
    'omnivore.label',
    'omnivore.library_item',
    'omnivore.group_membership',
    'omnivore.invite',
    'omnivore.group',
    'omnivore.filter',
    'omnivore.user_personalization',
    'omnivore.user_profile',
    'omnivore.user',
  ]

  for (const table of tables) {
    await ds.query(`TRUNCATE TABLE ${table} CASCADE`)
  }

  // Re-enable foreign key checks
  await ds.query('SET session_replication_role = DEFAULT')
}
