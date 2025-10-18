import { DataSource } from 'typeorm'

/**
 * Get the current test DataSource instance
 * This is set by the global setup and used by factories
 *
 * This file does NOT import testcontainers, avoiding ESM import issues in Jest
 */
export function getTestDataSource(): DataSource {
  // @ts-ignore - DataSource is set by global setup
  const dataSource = globalThis.__TEST_DATASOURCE__ as DataSource

  if (!dataSource || !dataSource.isInitialized) {
    throw new Error(
      'Test DataSource not initialized. Make sure globalSetup has run.',
    )
  }

  return dataSource
}
