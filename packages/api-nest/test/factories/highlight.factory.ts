import { faker } from '@faker-js/faker'
import { Repository } from 'typeorm'
import {
  HighlightEntity,
  HighlightType,
  HighlightColor,
} from '../../src/highlight/entities/highlight.entity'
import { BaseFactory, getTestRepository } from './base.factory'

/**
 * HighlightFactory - Generate test highlights
 *
 * @example
 * ```typescript
 * // Create a highlight
 * const highlight = await HighlightFactory.create({
 *   libraryItemId: item.id,
 *   userId: user.id
 * })
 *
 * // Use helper methods
 * const redHighlight = await HighlightFactory.withColor(item.id, user.id, 'red')
 * ```
 */
class HighlightFactoryClass extends BaseFactory<HighlightEntity> {
  protected generateDefaults(): Partial<HighlightEntity> {
    const shortTimestamp = Date.now().toString().slice(-8)
    const quote = faker.lorem.sentence()

    return {
      id: faker.string.uuid(),
      shortId: `h${shortTimestamp}${faker.string.alphanumeric(2)}`,
      quote,
      prefix: faker.lorem.words(3),
      suffix: faker.lorem.words(3),
      highlightPositionPercent: faker.number.int({ min: 10, max: 90 }),
      highlightPositionAnchorIndex: faker.number.int({ min: 0, max: 100 }),
      color: HighlightColor.YELLOW,
      highlightType: HighlightType.HIGHLIGHT,
      // Selectors format: JSON object with textQuote.exact required by database constraint
      // Match the format from highlight.service.ts
      selectors: {
        textQuote: {
          exact: quote,
          prefix: faker.lorem.words(3),
          suffix: faker.lorem.words(3),
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      // These will be set by the caller
      libraryItemId: '', // Must be provided
      userId: '', // Must be provided
      libraryItem: undefined,
      user: undefined,
    }
  }

  protected getRepository(): Repository<HighlightEntity> {
    return getTestRepository(HighlightEntity)
  }

  /**
   * Create a highlight with a specific color
   */
  async withColor(
    libraryItemId: string,
    userId: string,
    color: HighlightColor,
    overrides: Partial<HighlightEntity> = {},
  ): Promise<HighlightEntity> {
    return this.create({
      libraryItemId,
      userId,
      color,
      ...overrides,
    })
  }

  /**
   * Create a highlight with annotation
   */
  async withAnnotation(
    libraryItemId: string,
    userId: string,
    annotation: string,
    overrides: Partial<HighlightEntity> = {},
  ): Promise<HighlightEntity> {
    return this.create({
      libraryItemId,
      userId,
      annotation,
      ...overrides,
    })
  }

  /**
   * Create a redacted highlight
   */
  async redacted(
    libraryItemId: string,
    userId: string,
    overrides: Partial<HighlightEntity> = {},
  ): Promise<HighlightEntity> {
    return this.create({
      libraryItemId,
      userId,
      highlightType: HighlightType.REDACTION,
      ...overrides,
    })
  }

  /**
   * Create multiple highlights for an article
   */
  async createManyForArticle(
    libraryItemId: string,
    userId: string,
    count: number,
  ): Promise<HighlightEntity[]> {
    const highlights: HighlightEntity[] = []

    for (let i = 0; i < count; i++) {
      highlights.push(
        await this.create({
          libraryItemId,
          userId,
          highlightPositionPercent: (i + 1) * (100 / (count + 1)),
        }),
      )
    }

    return highlights
  }

  /**
   * Build highlight with color (in memory)
   */
  buildWithColor(
    libraryItemId: string,
    userId: string,
    color: HighlightColor,
    overrides: Partial<HighlightEntity> = {},
  ): HighlightEntity {
    return this.build({
      libraryItemId,
      userId,
      color,
      ...overrides,
    })
  }
}

// Export singleton instance
export const HighlightFactory = new HighlightFactoryClass()
