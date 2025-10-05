import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import {
  LibraryItemEntity,
  LibraryItemState,
} from './entities/library-item.entity'
import {
  ReadingProgressInput,
  LibrarySearchInput,
  LibrarySortField,
  SortOrder,
  SaveUrlInput,
} from './dto/library-inputs.type'

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name)

  constructor(
    @InjectRepository(LibraryItemEntity)
    private readonly libraryRepository: Repository<LibraryItemEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async listForUser(
    userId: string,
    first: number,
    after?: string,
    search?: LibrarySearchInput,
  ): Promise<{ items: LibraryItemEntity[]; nextCursor: string | null }> {
    const limit = Math.min(Math.max(first, 1), 100)

    const query = this.libraryRepository
      .createQueryBuilder('item')
      .where('item.userId = :userId', { userId })

    // Apply folder filter
    if (search?.folder && search.folder !== 'all') {
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
      // For cursor pagination, we need to use the sort field
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

  async findById(userId: string, id: string): Promise<LibraryItemEntity | null> {
    return this.libraryRepository.findOne({
      where: {
        id,
        userId,
      },
    })
  }

  /**
   * Archive or unarchive a library item
   * @param userId - User ID who owns the item
   * @param itemId - Library item ID
   * @param archived - Whether to archive (true) or unarchive (false)
   * @returns Updated library item
   */
  async archiveItem(
    userId: string,
    itemId: string,
    archived: boolean,
  ): Promise<LibraryItemEntity> {
    const item = await this.findById(userId, itemId)

    if (!item) {
      throw new NotFoundException(`Library item with ID ${itemId} not found`)
    }

    // Update state and folder based on archive status
    item.state = archived ? LibraryItemState.ARCHIVED : LibraryItemState.SUCCEEDED
    item.folder = archived ? 'archive' : 'inbox'

    await this.libraryRepository.save(item)
    return item
  }

  /**
   * Delete a library item (soft delete by moving to trash or marking as deleted)
   * @param userId - User ID who owns the item
   * @param itemId - Library item ID
   * @returns Success result
   */
  async deleteItem(
    userId: string,
    itemId: string,
  ): Promise<{ success: boolean; message?: string; itemId: string }> {
    const item = await this.findById(userId, itemId)

    if (!item) {
      throw new NotFoundException(`Library item with ID ${itemId} not found`)
    }

    // If already in trash, perform hard delete (mark as DELETED)
    if (item.folder === 'trash') {
      item.state = LibraryItemState.DELETED
      await this.libraryRepository.save(item)
      return {
        success: true,
        message: 'Item permanently deleted',
        itemId,
      }
    }

    // Otherwise, soft delete by moving to trash
    item.folder = 'trash'
    item.state = LibraryItemState.DELETED
    await this.libraryRepository.save(item)

    return {
      success: true,
      message: 'Item moved to trash',
      itemId,
    }
  }

  /**
   * Update reading progress for a library item
   * @param userId - User ID who owns the item
   * @param itemId - Library item ID
   * @param progress - Reading progress data
   * @returns Updated library item
   */
  async updateReadingProgress(
    userId: string,
    itemId: string,
    progress: ReadingProgressInput,
  ): Promise<LibraryItemEntity> {
    const item = await this.findById(userId, itemId)

    if (!item) {
      throw new NotFoundException(`Library item with ID ${itemId} not found`)
    }

    // Validate progress percentages
    if (
      progress.readingProgressTopPercent < 0 ||
      progress.readingProgressTopPercent > 100
    ) {
      throw new BadRequestException(
        'Reading progress top percent must be between 0 and 100',
      )
    }

    if (
      progress.readingProgressBottomPercent < 0 ||
      progress.readingProgressBottomPercent > 100
    ) {
      throw new BadRequestException(
        'Reading progress bottom percent must be between 0 and 100',
      )
    }

    // Update reading progress fields
    item.readingProgressTopPercent = progress.readingProgressTopPercent
    item.readingProgressBottomPercent = progress.readingProgressBottomPercent

    if (progress.readingProgressAnchorIndex !== undefined) {
      item.readingProgressLastReadAnchor = progress.readingProgressAnchorIndex
    }

    if (progress.readingProgressHighestAnchor !== undefined) {
      item.readingProgressHighestReadAnchor =
        progress.readingProgressHighestAnchor
    }

    // If progress is 100%, mark as read
    if (progress.readingProgressTopPercent === 100) {
      item.readAt = new Date()
    }

    await this.libraryRepository.save(item)
    return item
  }

  /**
   * Move a library item to a different folder
   * @param userId - User ID who owns the item
   * @param itemId - Library item ID
   * @param folder - Target folder (inbox, archive, trash)
   * @returns Updated library item
   */
  async moveToFolder(
    userId: string,
    itemId: string,
    folder: string,
  ): Promise<LibraryItemEntity> {
    const item = await this.findById(userId, itemId)

    if (!item) {
      throw new NotFoundException(`Library item with ID ${itemId} not found`)
    }

    // Validate folder
    const validFolders = ['inbox', 'archive', 'trash']
    if (!validFolders.includes(folder)) {
      throw new BadRequestException(
        `Invalid folder. Must be one of: ${validFolders.join(', ')}`,
      )
    }

    // Update folder and corresponding state
    item.folder = folder

    // Update state based on folder
    if (folder === 'archive') {
      item.state = LibraryItemState.ARCHIVED
    } else if (folder === 'trash') {
      item.state = LibraryItemState.DELETED
    } else if (folder === 'inbox') {
      item.state = LibraryItemState.SUCCEEDED
    }

    await this.libraryRepository.save(item)
    return item
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk archive or unarchive library items
   * @param userId - User ID who owns the items
   * @param itemIds - List of library item IDs
   * @param archived - Whether to archive (true) or unarchive (false)
   * @returns Bulk action result with success/failure counts
   */
  async bulkArchive(
    userId: string,
    itemIds: string[],
    archived: boolean,
  ): Promise<{
    success: boolean
    successCount: number
    failureCount: number
    errors?: string[]
    message?: string
  }> {
    // Validate input
    if (!itemIds || itemIds.length === 0) {
      throw new BadRequestException('No item IDs provided')
    }

    // Limit bulk operations to prevent abuse
    const maxBulkSize = 1000
    if (itemIds.length > maxBulkSize) {
      throw new BadRequestException(
        `Bulk operation limited to ${maxBulkSize} items`,
      )
    }

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
            folder: archived ? 'archive' : 'inbox',
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
   * Bulk delete library items
   * @param userId - User ID who owns the items
   * @param itemIds - List of library item IDs
   * @returns Bulk action result with success/failure counts
   */
  async bulkDelete(
    userId: string,
    itemIds: string[],
  ): Promise<{
    success: boolean
    successCount: number
    failureCount: number
    errors?: string[]
    message?: string
  }> {
    // Validate input
    if (!itemIds || itemIds.length === 0) {
      throw new BadRequestException('No item IDs provided')
    }

    // Limit bulk operations
    const maxBulkSize = 1000
    if (itemIds.length > maxBulkSize) {
      throw new BadRequestException(
        `Bulk operation limited to ${maxBulkSize} items`,
      )
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

        // Mark items as deleted (soft delete)
        const result = await queryRunner.manager
          .createQueryBuilder()
          .update(LibraryItemEntity)
          .set({
            state: LibraryItemState.DELETED,
            folder: 'trash',
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
   * @param userId - User ID who owns the items
   * @param itemIds - List of library item IDs
   * @param folder - Target folder (inbox, archive, trash)
   * @returns Bulk action result with success/failure counts
   */
  async bulkMoveToFolder(
    userId: string,
    itemIds: string[],
    folder: string,
  ): Promise<{
    success: boolean
    successCount: number
    failureCount: number
    errors?: string[]
    message?: string
  }> {
    // Validate input
    if (!itemIds || itemIds.length === 0) {
      throw new BadRequestException('No item IDs provided')
    }

    // Validate folder
    const validFolders = ['inbox', 'archive', 'trash']
    if (!validFolders.includes(folder)) {
      throw new BadRequestException(
        `Invalid folder. Must be one of: ${validFolders.join(', ')}`,
      )
    }

    // Limit bulk operations
    const maxBulkSize = 1000
    if (itemIds.length > maxBulkSize) {
      throw new BadRequestException(
        `Bulk operation limited to ${maxBulkSize} items`,
      )
    }

    // Determine state based on folder
    let state: LibraryItemState
    if (folder === 'archive') {
      state = LibraryItemState.ARCHIVED
    } else if (folder === 'trash') {
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
   * @param userId - User ID who owns the items
   * @param itemIds - List of library item IDs
   * @returns Bulk action result with success/failure counts
   */
  async bulkMarkAsRead(
    userId: string,
    itemIds: string[],
  ): Promise<{
    success: boolean
    successCount: number
    failureCount: number
    errors?: string[]
    message?: string
  }> {
    // Validate input
    if (!itemIds || itemIds.length === 0) {
      throw new BadRequestException('No item IDs provided')
    }

    // Limit bulk operations
    const maxBulkSize = 1000
    if (itemIds.length > maxBulkSize) {
      throw new BadRequestException(
        `Bulk operation limited to ${maxBulkSize} items`,
      )
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

  /**
   * Save a URL to the user's library
   */
  async saveUrl(
    userId: string,
    input: SaveUrlInput,
  ): Promise<LibraryItemEntity> {
    const { url, folder = 'inbox' } = input

    this.logger.log(`Saving URL for user ${userId}: ${url}`)

    // Check for duplicate URL
    const existingItem = await this.libraryRepository.findOne({
      where: {
        userId,
        originalUrl: url,
      },
    })

    if (existingItem) {
      throw new ConflictException(
        'This URL has already been saved to your library',
      )
    }

    // Create library item with CONTENT_NOT_FETCHED state
    // Content extraction will be handled by queue in ARC-012
    const slug = this.generateSlug(url)

    const libraryItem = this.libraryRepository.create({
      userId,
      originalUrl: url,
      slug,
      title: url, // Temporary title until content is fetched
      state: LibraryItemState.CONTENT_NOT_FETCHED,
      folder,
      savedAt: new Date(),
      contentReader: 'WEB' as any,
      itemType: 'ARTICLE',
    })

    const savedItem = await this.libraryRepository.save(libraryItem)

    this.logger.log(
      `Successfully saved URL with ID: ${savedItem.id} (content extraction deferred to queue)`,
    )

    // TODO: Dispatch to queue for content extraction (ARC-012)
    // TODO: Use @omnivore/readability for proper extraction (ARC-013)

    return savedItem
  }

  /**
   * Generate a slug from URL
   */
  private generateSlug(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname

      // Extract meaningful part from pathname
      let slug = pathname
        .split('/')
        .filter((part) => part.length > 0)
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100)

      if (!slug) {
        slug = urlObj.hostname.replace(/\./g, '-')
      }

      // Add timestamp to ensure uniqueness
      const timestamp = Date.now()
      return `${slug}-${timestamp}`
    } catch {
      return `url-${Date.now()}`
    }
  }

}
