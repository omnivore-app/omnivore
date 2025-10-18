import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
  Inject,
} from '@nestjs/common'
import {
  LibraryItemEntity,
  LibraryItemState,
} from './entities/library-item.entity'
import {
  ReadingProgressInput,
  LibrarySearchInput,
  SaveUrlInput,
} from './dto/library-inputs.type'
import { EventBusService } from '../queue/event-bus.service'
import { EVENT_NAMES } from '../queue/events.constants'
import { JOB_PRIORITY } from '../queue/queue.constants'
import { ILibraryItemRepository } from '../repositories/interfaces/library-item-repository.interface'
import { FOLDERS, VALID_FOLDERS } from '../constants/folders.constants'

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name)

  constructor(
    @Inject('ILibraryItemRepository')
    private readonly libraryRepository: ILibraryItemRepository,
    private readonly eventBus: EventBusService,
  ) {}

  /**
   * List library items for a user with pagination and optional filtering
   * @param userId - User ID to fetch items for
   * @param first - Number of items to fetch (pagination limit)
   * @param after - Cursor for pagination (optional)
   * @param search - Search and filter criteria (optional)
   * @returns Paginated list of library items with next cursor
   */
  async listForUser(
    userId: string,
    first: number,
    after?: string,
    search?: LibrarySearchInput,
  ): Promise<{ items: LibraryItemEntity[]; nextCursor: string | null }> {
    // Delegate to repository - all query logic is now in the repository layer
    return this.libraryRepository.listForUser(userId, first, after, search)
  }

  /**
   * Find a library item by ID for a specific user
   * @param userId - User ID who owns the item
   * @param id - Library item ID
   * @returns Library item or null if not found
   */
  async findById(userId: string, id: string): Promise<LibraryItemEntity | null> {
    return this.libraryRepository.findById(id, userId)
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
    item.folder = archived ? FOLDERS.ARCHIVE : FOLDERS.INBOX

    return await this.libraryRepository.save(item)
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
    if (item.folder === FOLDERS.TRASH) {
      item.state = LibraryItemState.DELETED
      await this.libraryRepository.save(item)
      return {
        success: true,
        message: 'Item permanently deleted',
        itemId,
      }
    }

    // Otherwise, soft delete by moving to trash
    item.folder = FOLDERS.TRASH
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
    if (!VALID_FOLDERS.includes(folder as any)) {
      throw new BadRequestException(
        `Invalid folder. Must be one of: ${VALID_FOLDERS.join(', ')}`,
      )
    }

    // Update folder and corresponding state
    item.folder = folder

    // Update state based on folder
    if (folder === FOLDERS.ARCHIVE) {
      item.state = LibraryItemState.ARCHIVED
    } else if (folder === FOLDERS.TRASH) {
      item.state = LibraryItemState.DELETED
    } else if (folder === FOLDERS.INBOX) {
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

    // Delegate to repository - transaction handling and batch processing in repository
    return this.libraryRepository.bulkArchive(userId, itemIds, archived)
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

    // Delegate to repository
    return this.libraryRepository.bulkDelete(userId, itemIds)
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
    if (!VALID_FOLDERS.includes(folder as any)) {
      throw new BadRequestException(
        `Invalid folder. Must be one of: ${VALID_FOLDERS.join(', ')}`,
      )
    }

    // Limit bulk operations
    const maxBulkSize = 1000
    if (itemIds.length > maxBulkSize) {
      throw new BadRequestException(
        `Bulk operation limited to ${maxBulkSize} items`,
      )
    }

    // Delegate to repository
    return this.libraryRepository.bulkMoveToFolder(userId, itemIds, folder)
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

    // Delegate to repository
    return this.libraryRepository.bulkMarkAsRead(userId, itemIds)
  }

  /**
   * Save a URL to the user's library and trigger background content extraction
   * Creates a library item in CONTENT_NOT_FETCHED state and dispatches an event
   * to the content processing queue for background extraction.
   * @param userId - User ID who is saving the URL
   * @param input - URL save request input (url, folder, source)
   * @returns Created library item
   * @throws ConflictException if URL already exists in user's library
   */
  async saveUrl(
    userId: string,
    input: SaveUrlInput,
  ): Promise<LibraryItemEntity> {
    const { url, folder = FOLDERS.INBOX } = input

    this.logger.log(`Saving URL for user ${userId}: ${url}`)

    // Check for duplicate URL
    const existingItem = await this.libraryRepository.findByUrl(url, userId)

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
      `Successfully saved URL with ID: ${savedItem.id}, dispatching to queue for content extraction`,
    )

    // Emit event to trigger background content processing
    this.eventBus.emitContentSaveRequested({
      eventType: EVENT_NAMES.CONTENT_SAVE_REQUESTED,
      libraryItemId: savedItem.id,
      url: savedItem.originalUrl,
      userId: savedItem.userId,
      priority: JOB_PRIORITY.NORMAL,
      source: input.source || 'web',
      timestamp: new Date(),
    })

    this.logger.log(`Content processing job enqueued for item ${savedItem.id}`)

    return savedItem
  }

  /**
   * Update notebook content for a library item
   * @param userId - User ID who owns the item
   * @param itemId - Library item ID
   * @param note - Notebook content (supports markdown)
   * @returns Updated library item
   */
  async updateNotebook(
    userId: string,
    itemId: string,
    note: string,
  ): Promise<LibraryItemEntity> {
    const item = await this.findById(userId, itemId)

    if (!item) {
      throw new NotFoundException(`Library item with ID ${itemId} not found`)
    }

    // Update note and timestamp
    item.note = note
    item.noteUpdatedAt = new Date()

    await this.libraryRepository.save(item)
    return item
  }

  /**
   * Generate a unique, URL-safe slug from a URL
   * Extracts meaningful parts from the URL pathname and adds a timestamp
   * to ensure uniqueness across all library items.
   * @param url - The URL to generate a slug from
   * @returns A unique, URL-safe slug (max 100 chars + timestamp)
   * @private
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
