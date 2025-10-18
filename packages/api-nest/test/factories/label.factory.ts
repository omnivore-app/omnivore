import { faker } from '@faker-js/faker'
import { Repository } from 'typeorm'
import { Label } from '../../src/label/entities/label.entity'
import { BaseFactory, getTestRepository } from './base.factory'

/**
 * LabelFactory - Generate test labels
 *
 * @example
 * ```typescript
 * // Create a label
 * const label = await LabelFactory.create({
 *   userId: user.id,
 *   name: 'Important'
 * })
 *
 * // Use helper methods
 * const internalLabel = await LabelFactory.internal(user.id, 'RSS')
 * ```
 */
class LabelFactoryClass extends BaseFactory<Label> {
  private static labelColors = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#FF33F5',
    '#F5FF33',
    '#33FFF5',
  ]

  protected generateDefaults() {
    return {
      id: faker.string.uuid(),
      name: faker.word.adjective() + '-' + faker.word.noun(),
      color: faker.helpers.arrayElement(LabelFactoryClass.labelColors),
      description: faker.lorem.sentence(),
      position: faker.number.int({ min: 0, max: 100 }),
      internal: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Must be set by caller
      userId: '', // Must be provided
      user: undefined,
    }
  }

  protected getRepository(): Repository<Label> {
    return getTestRepository(Label)
  }

  /**
   * Create an internal label (system-created, not deletable)
   */
  async internal(
    userId: string,
    name: string,
    overrides: Partial<Label> = {},
  ): Promise<Label> {
    return this.create({
      userId,
      name,
      internal: true,
      ...overrides,
    })
  }

  /**
   * Create a label with a specific color
   */
  async withColor(
    userId: string,
    color: string,
    overrides: Partial<Label> = {},
  ): Promise<Label> {
    return this.create({
      userId,
      color,
      ...overrides,
    })
  }

  /**
   * Create multiple labels for a user
   */
  async createManyForUser(userId: string, count: number): Promise<Label[]> {
    const labels: Label[] = []

    for (let i = 0; i < count; i++) {
      labels.push(
        await this.create({
          userId,
          position: i,
        }),
      )
    }

    return labels
  }

  /**
   * Build internal label (in memory)
   */
  buildInternal(
    userId: string,
    name: string,
    overrides: Partial<Label> = {},
  ): Label {
    return this.build({
      userId,
      name,
      internal: true,
      ...overrides,
    })
  }
}

// Export singleton instance
export const LabelFactory = new LabelFactoryClass()
