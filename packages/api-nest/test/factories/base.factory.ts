import { DeepPartial, Repository } from 'typeorm'
import { getTestDataSource } from '../setup/test-datasource'

/**
 * Base Factory for generating test data
 * Provides two methods:
 * - build(): Creates entity in memory (for unit tests with mocks)
 * - create(): Saves entity to database (for integration/E2E tests)
 *
 * @example
 * ```typescript
 * // Unit test (no database)
 * const user = UserFactory.build({ email: 'test@example.com' })
 *
 * // Integration test (with database)
 * const user = await UserFactory.create({ email: 'test@example.com' })
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
 * Helper function to get a repository from the test DataSource
 * Used by factory implementations
 *
 * @param entityClass - Entity class to get repository for
 * @returns TypeORM Repository instance
 */
export function getTestRepository<Entity>(
  entityClass: new () => Entity,
): Repository<Entity> {
  const dataSource = getTestDataSource()
  return dataSource.getRepository(entityClass)
}
