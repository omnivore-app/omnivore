import { faker } from '@faker-js/faker'
import { Repository } from 'typeorm'
import {
  LibraryItemEntity,
  LibraryItemState,
  ContentReaderType,
} from '../../src/library/entities/library-item.entity'
import { BaseFactory, getTestRepository } from './base.factory'
import { FOLDERS } from '../../src/constants/folders.constants'

/**
 * LibraryItemFactory - Generate test library items
 *
 * @example
 * ```typescript
 * // Create a library item
 * const item = await LibraryItemFactory.create({
 *   userId: user.id,
 *   title: 'Test Article'
 * })
 *
 * // Use helper methods
 * const archivedItem = await LibraryItemFactory.archived(user.id)
 * const deletedItem = await LibraryItemFactory.deleted(user.id)
 * ```
 */
class LibraryItemFactoryClass extends BaseFactory<LibraryItemEntity> {
  protected generateDefaults() {
    const timestamp = Date.now()
    const title = faker.lorem.sentence()

    return {
      id: faker.string.uuid(),
      title,
      slug: faker.helpers.slugify(title).toLowerCase() + `-${timestamp}`,
      originalUrl: faker.internet.url(),
      savedAt: new Date(),
      state: LibraryItemState.SUCCEEDED,
      folder: FOLDERS.INBOX,
      contentReader: ContentReaderType.WEB,
      itemType: 'ARTICLE',
      createdAt: new Date(),
      updatedAt: new Date(),
      // These will be set by the caller
      userId: '', // Must be provided
      user: undefined,
    }
  }

  protected getRepository(): Repository<LibraryItemEntity> {
    return getTestRepository(LibraryItemEntity)
  }

  /**
   * Create an archived library item
   */
  async archived(userId: string, overrides: Partial<LibraryItemEntity> = {}): Promise<LibraryItemEntity> {
    return this.create({
      userId,
      folder: FOLDERS.ARCHIVE,
      state: LibraryItemState.ARCHIVED,
      ...overrides,
    })
  }

  /**
   * Create a deleted library item (in trash)
   */
  async deleted(userId: string, overrides: Partial<LibraryItemEntity> = {}): Promise<LibraryItemEntity> {
    return this.create({
      userId,
      folder: FOLDERS.TRASH,
      state: LibraryItemState.DELETED,
      ...overrides,
    })
  }

  /**
   * Create an item with reading progress
   */
  async withProgress(
    userId: string,
    percentComplete: number,
    overrides: Partial<LibraryItemEntity> = {},
  ): Promise<LibraryItemEntity> {
    const readAt = percentComplete === 100 ? new Date() : null

    return this.create({
      userId,
      readingProgressTopPercent: percentComplete,
      readingProgressBottomPercent: Math.min(percentComplete + 5, 100),
      readAt,
      ...overrides,
    })
  }

  /**
   * Create an item that's still being processed
   */
  async processing(userId: string, overrides: Partial<LibraryItemEntity> = {}): Promise<LibraryItemEntity> {
    return this.create({
      userId,
      state: LibraryItemState.CONTENT_NOT_FETCHED,
      title: faker.internet.url(), // Temporary title (URL)
      ...overrides,
    })
  }

  /**
   * Create an item with a notebook
   */
  async withNotebook(
    userId: string,
    noteContent: string,
    overrides: Partial<LibraryItemEntity> = {},
  ): Promise<LibraryItemEntity> {
    return this.create({
      userId,
      note: noteContent,
      noteUpdatedAt: new Date(),
      ...overrides,
    })
  }

  /**
   * Create a PDF library item
   */
  async pdf(userId: string, overrides: Partial<LibraryItemEntity> = {}): Promise<LibraryItemEntity> {
    return this.create({
      userId,
      contentReader: ContentReaderType.PDF,
      itemType: 'FILE',
      ...overrides,
    })
  }

  /**
   * Build archived item (in memory)
   */
  buildArchived(userId: string, overrides: Partial<LibraryItemEntity> = {}): LibraryItemEntity {
    return this.build({
      userId,
      folder: FOLDERS.ARCHIVE,
      state: LibraryItemState.ARCHIVED,
      ...overrides,
    })
  }

  /**
   * Build item with progress (in memory)
   */
  buildWithProgress(
    userId: string,
    percentComplete: number,
    overrides: Partial<LibraryItemEntity> = {},
  ): LibraryItemEntity {
    return this.build({
      userId,
      readingProgressTopPercent: percentComplete,
      readingProgressBottomPercent: Math.min(percentComplete + 5, 100),
      readAt: percentComplete === 100 ? new Date() : null,
      ...overrides,
    })
  }
}

// Export singleton instance
export const LibraryItemFactory = new LibraryItemFactoryClass()
