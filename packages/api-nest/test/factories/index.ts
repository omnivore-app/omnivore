/**
 * Test Data Factories
 *
 * Provides easy-to-use factories for generating test data with Faker.js
 * Supports both in-memory entity creation (build) and database persistence (create).
 *
 * @example
 * ```typescript
 * import { UserFactory, LibraryItemFactory } from './factories'
 *
 * // Create test user in database
 * const user = await UserFactory.create({ email: 'test@example.com' })
 *
 * // Create test library item
 * const item = await LibraryItemFactory.create({
 *   userId: user.id,
 *   title: 'Test Article'
 * })
 * ```
 */

export { UserFactory } from './user.factory'
export { LibraryItemFactory } from './library-item.factory'
export { HighlightFactory } from './highlight.factory'
export { LabelFactory } from './label.factory'
export { BaseFactory } from './base.factory'
