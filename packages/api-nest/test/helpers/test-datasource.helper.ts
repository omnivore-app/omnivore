import { DataSource } from 'typeorm'
import { INestApplication } from '@nestjs/common'

/**
 * Get Test DataSource from E2E App
 * 
 * Returns the TypeORM DataSource configured for the test database (testcontainer).
 * This is safer than importing test.config.ts directly.
 * 
 * @param app - The E2E test application
 * @returns DataSource connected to test database
 * 
 * @example
 * ```typescript
 * describe('My E2E Tests', () => {
 *   let app: INestApplication
 *   let dataSource: DataSource
 * 
 *   beforeAll(async () => {
 *     app = await createE2EApp()
 *     dataSource = getTestDataSource(app)
 *   })
 * 
 *   it('should insert test data', async () => {
 *     await dataSource.query(
 *       `INSERT INTO omnivore.library_item (...) VALUES (...)`,
 *       [...]
 *     )
 *   })
 * })
 * ```
 */
export function getTestDataSource(app: INestApplication): DataSource {
  return app.get(DataSource)
}

/**
 * Execute Raw SQL Query in Test Database
 * 
 * Convenience wrapper for executing raw SQL in E2E tests.
 * 
 * @param app - The E2E test application
 * @param query - SQL query to execute
 * @param parameters - Query parameters (optional)
 * @returns Query results
 * 
 * @example
 * ```typescript
 * await executeTestQuery(
 *   app,
 *   `UPDATE omnivore.user SET status = $1 WHERE id = $2`,
 *   ['ACTIVE', userId]
 * )
 * ```
 */
export async function executeTestQuery<T = any>(
  app: INestApplication,
  query: string,
  parameters?: any[],
): Promise<T> {
  const dataSource = getTestDataSource(app)
  return dataSource.query(query, parameters)
}

/**
 * Activate Test User (Skip Email Confirmation)
 * 
 * Common helper to activate a newly registered test user without email confirmation.
 * 
 * @param app - The E2E test application
 * @param userId - User ID to activate
 * 
 * @example
 * ```typescript
 * const registerResponse = await request(app.getHttpServer())
 *   .post('/api/v2/auth/register')
 *   .send({ email, password, name })
 * 
 * await activateTestUser(app, registerResponse.body.user.id)
 * ```
 */
export async function activateTestUser(
  app: INestApplication,
  userId: string,
): Promise<void> {
  await executeTestQuery(
    app,
    `UPDATE omnivore.user SET status = 'ACTIVE' WHERE id = $1`,
    [userId],
  )
}

/**
 * Clean Test Data
 * 
 * Helper to clean up test data in the correct order (respecting foreign keys).
 * 
 * @param app - The E2E test application
 * @param userId - User ID to clean up data for
 * 
 * @example
 * ```typescript
 * afterAll(async () => {
 *   await cleanTestData(app, userId)
 *   await app.close()
 * })
 * ```
 */
export async function cleanTestData(
  app: INestApplication,
  userId: string,
): Promise<void> {
  const dataSource = getTestDataSource(app)

  // Delete in correct order (child tables first, then parent)
  await dataSource.query(
    `DELETE FROM omnivore.entity_labels WHERE library_item_id IN 
     (SELECT id FROM omnivore.library_item WHERE user_id = $1)`,
    [userId],
  )

  await dataSource.query(
    `DELETE FROM omnivore.highlights WHERE library_item_id IN 
     (SELECT id FROM omnivore.library_item WHERE user_id = $1)`,
    [userId],
  )

  await dataSource.query(
    `DELETE FROM omnivore.reading_progress WHERE library_item_id IN 
     (SELECT id FROM omnivore.library_item WHERE user_id = $1)`,
    [userId],
  )

  await dataSource.query(
    `DELETE FROM omnivore.library_item WHERE user_id = $1`,
    [userId],
  )

  await dataSource.query(`DELETE FROM omnivore.labels WHERE user_id = $1`, [
    userId,
  ])

  await dataSource.query(
    `DELETE FROM omnivore.user_personalization WHERE user_id = $1`,
    [userId],
  )

  await dataSource.query(`DELETE FROM omnivore.user_profile WHERE user_id = $1`, [
    userId,
  ])

  await dataSource.query(`DELETE FROM omnivore.user WHERE id = $1`, [userId])
}

