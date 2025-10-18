import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import {
  LibraryItemEntity,
  LibraryItemState,
} from '../library/entities/library-item.entity'
import {
  LibrarySearchInput,
  LibrarySortField,
  SortOrder,
} from '../library/dto/library-inputs.type'
import {
  ILibraryItemRepository,
  PaginatedResult,
  BulkOperationResult,
} from './interfaces/library-item-repository.interface'
import { FOLDERS } from '../constants/folders.constants'

/**
 * Repository for LibraryItem entity
 * Handles all data access operations for library items
 */
@Injectable()
export class LibraryItemRepository implements ILibraryItemRepository {
  constructor(
    @InjectRepository(LibraryItemEntity)
    private readonly repository: Repository<LibraryItemEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find a library item by ID and user ID
   */
  async findById(
    id: string,
    userId: string,
  ): Promise<LibraryItemEntity | null> {
    return this.repository.findOne({
      where: {
        id,
        userId,
      },
    })
  }

  /**
   * Find a library item by URL and user ID (for duplicate detection)
   */
  async findByUrl(
    url: string,
    userId: string,
  ): Promise<LibraryItemEntity | null> {
    return this.repository.findOne({
      where: {
        userId,
        originalUrl: url,
      },
    })
  }

  /**
   * List library items for a user with pagination and filtering
   */
  async listForUser(
    userId: string,
    first: number,
    after?: string,
    search?: LibrarySearchInput,
  ): Promise<PaginatedResult<LibraryItemEntity>> {
    const limit = Math.min(Math.max(first, 1), 100)

    const query = this.repository
      .createQueryBuilder('item')
      .where('item.userId = :userId', { userId })

    // Apply folder filter
    if (search?.folder && search.folder !== FOLDERS.ALL) {
      query.andWhere('item.folder = :folder', { folder: search.folder })
    }

    // Apply state filter
    if (search?.state) {
      query.andWhere('item.state = :state', { state: search.state })
    }

    // Apply full-text search
    if (search?.query && search.query.trim()) {
      const searchTerm = `%${search.query.trim()}%`
      query.andWhere(
        '(item.title ILIKE :searchTerm OR item.description ILIKE :searchTerm OR item.author ILIKE :searchTerm)',
        { searchTerm },
      )
    }

    // Apply label filter
    if (search?.labels && search.labels.length > 0) {
      query.andWhere('item.labelNames && :labels', { labels: search.labels })
    }

    // Determine sort field and order
    const sortBy = search?.sortBy || LibrarySortField.SAVED_AT
    const sortOrder = search?.sortOrder || SortOrder.DESC

    // Map sort field to column name
    const sortColumn = `item.${sortBy}`

    query.orderBy(sortColumn, sortOrder).take(limit + 1)

    // Handle cursor-based pagination
    if (after) {
      const cursorDate = new Date(after)
      if (!Number.isNaN(cursorDate.getTime())) {
        const operator = sortOrder === SortOrder.DESC ? '<' : '>'
        query.andWhere(`${sortColumn} ${operator} :cursor`, {
          cursor: cursorDate,
        })
      }
    }

    const rows = await query.getMany()
    const hasNext = rows.length > limit
    const sliced = hasNext ? rows.slice(0, limit) : rows

    // Generate next cursor based on sort field
    let nextCursor: string | null = null
    if (hasNext && sliced.length > 0) {
      const lastItem = sliced[sliced.length - 1]
      const cursorField = sortBy as keyof LibraryItemEntity
      const cursorValue = lastItem[cursorField]

      if (cursorValue instanceof Date) {
        nextCursor = cursorValue.toISOString()
      } else if (typeof cursorValue === 'string') {
        nextCursor = cursorValue
      } else {
        nextCursor = lastItem.savedAt.toISOString()
      }
    }

    return { items: sliced, nextCursor }
  }

  /**
   * Save (create or update) a library item
   */
  async save(item: LibraryItemEntity): Promise<LibraryItemEntity> {
    return this.repository.save(item)
  }

  /**
   * Create a new library item (without saving to database)
   */
  create(data: Partial<LibraryItemEntity>): LibraryItemEntity {
    return this.repository.create(data)
  }

  /**
   * Bulk archive or unarchive library items
   */
  async bulkArchive(
    userId: string,
    itemIds: string[],
    archived: boolean,
  ): Promise<BulkOperationResult> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const errors: string[] = []
    let successCount = 0
    let failureCount = 0

    try {
      // Process items in batches for better performance
      const batchSize = 100
      for (let i = 0; i < itemIds.length; i += batchSize) {
        const batch = itemIds.slice(i, i + batchSize)

        // Update items that belong to the user
        const result = await queryRunner.manager
          .createQueryBuilder()
          .update(LibraryItemEntity)
          .set({
            state: archived
              ? LibraryItemState.ARCHIVED
              : LibraryItemState.SUCCEEDED,
            folder: archived ? FOLDERS.ARCHIVE : FOLDERS.INBOX,
          })
          .where('id IN (:...ids)', { ids: batch })
          .andWhere('userId = :userId', { userId })
          .execute()

        successCount += result.affected || 0
        failureCount += batch.length - (result.affected || 0)

        // Track which items failed
        if (result.affected !== batch.length) {
          const failedIds = batch.slice(result.affected || 0)
          errors.push(
            `Failed to ${archived ? 'archive' : 'unarchive'} items: ${failedIds.join(', ')}`,
          )
        }
      }

      await queryRunner.commitTransaction()

      return {
        success: failureCount === 0,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully ${archived ? 'archived' : 'unarchived'} ${successCount} item(s)`,
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Bulk delete library items (soft delete)
   */
  async bulkDelete(
    userId: string,
    itemIds: string[],
  ): Promise<BulkOperationResult> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const errors: string[] = []
    let successCount = 0
    let failureCount = 0

    try {
      // Process items in batches
      const batchSize = 100
      for (let i = 0; i < itemIds.length; i += batchSize) {
        const batch = itemIds.slice(i, i + batchSize)

        // Mark items as deleted (soft delete)
        const result = await queryRunner.manager
          .createQueryBuilder()
          .update(LibraryItemEntity)
          .set({
            state: LibraryItemState.DELETED,
            folder: FOLDERS.TRASH,
          })
          .where('id IN (:...ids)', { ids: batch })
          .andWhere('userId = :userId', { userId })
          .execute()

        successCount += result.affected || 0
        failureCount += batch.length - (result.affected || 0)

        if (result.affected !== batch.length) {
          const failedIds = batch.slice(result.affected || 0)
          errors.push(`Failed to delete items: ${failedIds.join(', ')}`)
        }
      }

      await queryRunner.commitTransaction()

      return {
        success: failureCount === 0,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully deleted ${successCount} item(s)`,
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Bulk move library items to a different folder
   */
  async bulkMoveToFolder(
    userId: string,
    itemIds: string[],
    folder: string,
  ): Promise<BulkOperationResult> {
    // Determine state based on folder
    let state: LibraryItemState
    if (folder === FOLDERS.ARCHIVE) {
      state = LibraryItemState.ARCHIVED
    } else if (folder === FOLDERS.TRASH) {
      state = LibraryItemState.DELETED
    } else {
      state = LibraryItemState.SUCCEEDED
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const errors: string[] = []
    let successCount = 0
    let failureCount = 0

    try {
      // Process items in batches
      const batchSize = 100
      for (let i = 0; i < itemIds.length; i += batchSize) {
        const batch = itemIds.slice(i, i + batchSize)

        const result = await queryRunner.manager
          .createQueryBuilder()
          .update(LibraryItemEntity)
          .set({
            folder,
            state,
          })
          .where('id IN (:...ids)', { ids: batch })
          .andWhere('userId = :userId', { userId })
          .execute()

        successCount += result.affected || 0
        failureCount += batch.length - (result.affected || 0)

        if (result.affected !== batch.length) {
          const failedIds = batch.slice(result.affected || 0)
          errors.push(
            `Failed to move items to ${folder}: ${failedIds.join(', ')}`,
          )
        }
      }

      await queryRunner.commitTransaction()

      return {
        success: failureCount === 0,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully moved ${successCount} item(s) to ${folder}`,
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Bulk mark library items as read
   */
  async bulkMarkAsRead(
    userId: string,
    itemIds: string[],
  ): Promise<BulkOperationResult> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    const errors: string[] = []
    let successCount = 0
    let failureCount = 0

    try {
      // Process items in batches
      const batchSize = 100
      for (let i = 0; i < itemIds.length; i += batchSize) {
        const batch = itemIds.slice(i, i + batchSize)

        const result = await queryRunner.manager
          .createQueryBuilder()
          .update(LibraryItemEntity)
          .set({
            readAt: new Date(),
            readingProgressTopPercent: 100,
            readingProgressBottomPercent: 100,
          })
          .where('id IN (:...ids)', { ids: batch })
          .andWhere('userId = :userId', { userId })
          .execute()

        successCount += result.affected || 0
        failureCount += batch.length - (result.affected || 0)

        if (result.affected !== batch.length) {
          const failedIds = batch.slice(result.affected || 0)
          errors.push(`Failed to mark items as read: ${failedIds.join(', ')}`)
        }
      }

      await queryRunner.commitTransaction()

      return {
        success: failureCount === 0,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully marked ${successCount} item(s) as read`,
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
