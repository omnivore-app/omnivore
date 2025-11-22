import { INestApplication } from '@nestjs/common'
import { DeepPartial, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { getTestDataSource } from '../setup/test-datasource'

/**
 * Base Factory for generating test data
 * Provides two methods:
 * - build(): Creates entity in memory (for unit tests with mocks)
 * - create(): Saves entity to database (for integration/E2E tests)
 *
 * Factory Initialization Modes:
 * 1. E2E tests: Call FactoryRegistry.setApp(app) to use NestJS DI
 * 2. Integration tests: Uses globalThis.__TEST_DATASOURCE__ automatically
 *
 * @example
 * ```typescript
 * // E2E test setup (recommended)
 * beforeAll(async () => {
 *   app = await createE2EApp()
 *   FactoryRegistry.setApp(app)
 * })
 *
 * const user = await UserFactory.create({ email: 'test@example.com' })
 *
 * // Unit test (no database)
 * const user = UserFactory.build({ email: 'test@example.com' })
 * ```
 */
export abstract class BaseFactory<Entity> {
  /**
   * Build an entity in memory without saving to database
   * Useful for unit tests where you mock repositories
   *
   * @param overrides - Partial entity properties to override defaults
   * @returns Entity instance (not saved to DB)
   */
  build(overrides?: DeepPartial<Entity>): Entity {
    const defaults = this.generateDefaults()
    return {
      ...defaults,
      ...(overrides || {}),
    } as Entity
  }

  /**
   * Create and save an entity to the test database
   * Useful for integration/E2E tests that need real database data
   *
   * @param overrides - Partial entity properties to override defaults
   * @returns Promise of saved entity instance
   */
  async create(overrides?: DeepPartial<Entity>): Promise<Entity> {
    const entity = this.build(overrides)
    const repository = this.getRepository()
    return await repository.save(entity as any)
  }

  /**
   * Create multiple entities in the database
   * Efficient for seeding test data
   *
   * @param count - Number of entities to create
   * @param overrides - Properties to apply to all entities
   * @returns Promise of array of saved entities
   */
  async createMany(
    count: number,
    overrides?: DeepPartial<Entity>,
  ): Promise<Entity[]> {
    const entities: Entity[] = []

    for (let i = 0; i < count; i++) {
      entities.push(await this.create(overrides))
    }

    return entities
  }

  /**
   * Build multiple entities in memory
   *
   * @param count - Number of entities to build
   * @param overrides - Properties to apply to all entities
   * @returns Array of entity instances (not saved)
   */
  buildMany(count: number, overrides?: DeepPartial<Entity>): Entity[] {
    const entities: Entity[] = []

    for (let i = 0; i < count; i++) {
      entities.push(this.build(overrides))
    }

    return entities
  }

  /**
   * Generate default properties for the entity
   * Must be implemented by each factory to provide entity-specific defaults
   *
   * @returns Partial entity with default properties
   * @protected
   */
  protected abstract generateDefaults(): DeepPartial<Entity>

  /**
   * Get the TypeORM repository for this entity
   * Used by create() to save to database
   *
   * @returns TypeORM Repository instance
   * @protected
   */
  protected abstract getRepository(): Repository<Entity>
}

/**
 * Factory Registry - Manages NestJS app instance for E2E tests
 *
 * E2E tests should call FactoryRegistry.setApp(app) in beforeAll
 * to allow factories to use NestJS DI for repository access.
 */
export class FactoryRegistry {
  private static app: INestApplication | null = null

  /**
   * Set the NestJS app instance for E2E tests
   * Call this in beforeAll() after creating your test app
   *
   * @param app - NestJS application instance
   */
  static setApp(app: INestApplication): void {
    FactoryRegistry.app = app
  }

  /**
   * Clear the app instance (call in afterAll)
   */
  static clearApp(): void {
    FactoryRegistry.app = null
  }

  /**
   * Get the current app instance
   * @internal
   */
  static getApp(): INestApplication | null {
    return FactoryRegistry.app
  }
}

/**
 * Helper function to get a repository from the test DataSource
 * Used by factory implementations
 *
 * Behavior:
 * - If E2E app is set (via FactoryRegistry.setApp), uses NestJS DI
 * - Otherwise, falls back to globalThis.__TEST_DATASOURCE__
 *
 * @param entityClass - Entity class to get repository for
 * @returns TypeORM Repository instance
 */
export function getTestRepository<Entity>(
  entityClass: new () => Entity,
): Repository<Entity> {
  const app = FactoryRegistry.getApp()

  if (app) {
    // E2E test mode: Use NestJS DI (proper abstraction layer)
    const repositoryToken = getRepositoryToken(entityClass)
    return app.get<Repository<Entity>>(repositoryToken)
  }

  // Integration/migration test mode: Use global DataSource
  const dataSource = getTestDataSource()
  return dataSource.getRepository(entityClass)
}
