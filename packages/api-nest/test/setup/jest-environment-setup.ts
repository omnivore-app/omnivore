/**
 * Jest Environment Setup
 * Runs in each test worker to initialize the test DataSource
 */

import './test-logger-config' // Import logger configuration to suppress noise
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

/**
 * Initialize test DataSource using connection details from global setup
 * This runs once per test worker
 */
async function initializeTestDataSource() {
  // Get connection details set by global setup
  const host = process.env.TEST_DB_HOST
  const port = parseInt(process.env.TEST_DB_PORT || '5432')
  const database = process.env.TEST_DB_DATABASE
  const username = process.env.TEST_DB_USERNAME
  const password = process.env.TEST_DB_PASSWORD

  if (!host || !database || !username || !password) {
    throw new Error('Test database connection details not found. Make sure globalSetup ran successfully.')
  }

  // Create and initialize DataSource
  const dataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    database,
    username,
    password,
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
    synchronize: false, // Schema already created by global setup
    logging: false,
  })

  await dataSource.initialize()

  // Store in globalThis for factories to access
  // @ts-ignore
  globalThis.__TEST_DATASOURCE__ = dataSource

  return dataSource
}

// Initialize immediately when this file is loaded
beforeAll(async () => {
  await initializeTestDataSource()
})

// Clean up after all tests in this worker
afterAll(async () => {
  // @ts-ignore
  const dataSource = globalThis.__TEST_DATASOURCE__ as DataSource
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy()
  }
})
