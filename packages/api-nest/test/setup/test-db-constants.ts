/**
 * Test Database Constants
 *
 * Centralized constants for testcontainer database configuration.
 * These values are used by:
 * - global-setup.ts (to create testcontainer)
 * - Tests (if needed for assertions)
 *
 * DO NOT change these values unless you have a good reason.
 * They are specifically chosen for test isolation.
 */

export const TEST_DB_CONSTANTS = {
  /**
   * Database name for test container
   * Must contain 'test' for safety validation
   */
  DATABASE_NAME: 'test_omnivore',

  /**
   * Username for test database
   * Non-privileged user for security
   */
  USERNAME: 'test_user',

  /**
   * Password for test database
   * Simple password is fine for ephemeral containers
   */
  PASSWORD: 'test_password',

  /**
   * PostgreSQL version
   * Match production for accurate testing
   */
  POSTGRES_VERSION: 'postgres:15-alpine',

  /**
   * Container port
   * Standard PostgreSQL port
   */
  PORT: 5432,

  /**
   * Schema name
   * Must match production schema
   */
  SCHEMA: 'omnivore',
} as const

/**
 * Environment variable names for test database configuration
 * These are set by global-setup.ts and read by TestConfigService
 */
export const TEST_DB_ENV_VARS = {
  HOST: 'TEST_DATABASE_HOST',
  PORT: 'TEST_DATABASE_PORT',
  NAME: 'TEST_DATABASE_NAME',
  USER: 'TEST_DATABASE_USER',
  PASSWORD: 'TEST_DATABASE_PASSWORD',
} as const
