/**
 * Environment Detection Utilities
 *
 * Provides helper functions for detecting different runtime environments.
 * These utilities handle both current and potential future test environment types.
 */

/**
 * Check if running in any test environment
 *
 * Covers both unit tests (NODE_ENV=test) and potential future test types (e2e, integration).
 * Use this for general test-specific behavior like disabling external API calls,
 * using test Redis keys, or enabling verbose logging.
 *
 * @returns true if NODE_ENV indicates a test environment
 *
 * @example
 * ```typescript
 * if (isTestEnvironment()) {
 *   // Use test Redis keys
 *   KEY_PREFIX = 'omnivore:test:'
 * }
 * ```
 */
export function isTestEnvironment(): boolean {
  const testEnvs = ['test', 'e2e', 'integration'] // Future-proof
  return testEnvs.includes(process.env.NODE_ENV || '')
}

/**
 * Check if running E2E tests specifically
 *
 * E2E tests use testcontainers with full infrastructure (database, Redis, etc.).
 * They set TEST_DATABASE_* environment variables at runtime.
 *
 * @returns true if running E2E tests with testcontainer
 *
 * @example
 * ```typescript
 * if (isE2EEnvironment()) {
 *   console.log('Running with testcontainer infrastructure')
 * }
 * ```
 */
export function isE2EEnvironment(): boolean {
  // E2E tests currently use NODE_ENV=test but can be distinguished
  // by presence of TEST_DATABASE_* variables set by testcontainer
  return process.env.NODE_ENV === 'test' && !!process.env.TEST_DATABASE_NAME
}

/**
 * Check if running unit tests specifically
 *
 * Unit tests mock all dependencies and don't use real infrastructure.
 * They don't have TEST_DATABASE_* variables.
 *
 * @returns true if running unit tests (not E2E)
 *
 * @example
 * ```typescript
 * if (isUnitTestEnvironment()) {
 *   // All services should be mocked
 *   expect(mockService).toHaveBeenCalled()
 * }
 * ```
 */
export function isUnitTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' && !process.env.TEST_DATABASE_NAME
}

/**
 * Check if running in development environment
 *
 * @returns true if NODE_ENV is 'development'
 */
export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if running in production environment
 *
 * @returns true if NODE_ENV is 'production'
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Get the current environment name
 *
 * @returns The current NODE_ENV value or 'development' as default
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV || 'development'
}
