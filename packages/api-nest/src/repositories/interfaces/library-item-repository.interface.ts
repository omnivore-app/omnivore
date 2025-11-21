import { LibraryItemEntity } from '../../library/entities/library-item.entity'
import { LibrarySearchInput } from '../../library/dto/library-inputs.type'

/**
 * Options for finding library items
 */
export interface FindOptions {
  where?: Record<string, any>
  order?: Record<string, 'ASC' | 'DESC'>
  take?: number
  skip?: number
}

/**
 * Result of paginated library item query
 */
export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
}

/**
 * Result of bulk operations
 */
export interface BulkOperationResult {
  success: boolean
  successCount: number
  failureCount: number
  errors?: string[]
  message?: string
}

/**
 * Repository interface for LibraryItem entity
 * Separates data access layer from business logic
 */
export interface ILibraryItemRepository {
  // Find operations

  /**
   * Find a library item by ID and user ID
   * @param id - Library item ID
   * @param userId - User ID who owns the item
   * @returns Library item or null if not found
   */
  findById(id: string, userId: string): Promise<LibraryItemEntity | null>

  /**
   * Find multiple library items by IDs and user ID
   * @param ids - Array of library item IDs
   * @param userId - User ID who owns the items
   * @returns Array of library items (items not found are omitted)
   */
  findByIds(ids: string[], userId: string): Promise<LibraryItemEntity[]>

  /**
   * Find a library item by URL and user ID (for duplicate detection)
   * @param url - Original URL
   * @param userId - User ID who owns the item
   * @returns Library item or null if not found
   */
  findByUrl(url: string, userId: string): Promise<LibraryItemEntity | null>

  /**
   * List library items for a user with pagination and filtering
   * @param userId - User ID
   * @param first - Number of items to fetch
   * @param after - Cursor for pagination
   * @param search - Search and filter options
   * @returns Paginated result with items and next cursor
   */
  listForUser(
    userId: string,
    first: number,
    after?: string,
    search?: LibrarySearchInput,
  ): Promise<PaginatedResult<LibraryItemEntity>>

  /**
   * Save (create or update) a library item
   * @param item - Library item to save
   * @returns Saved library item
   */
  save(item: LibraryItemEntity): Promise<LibraryItemEntity>

  /**
   * Create a new library item (without saving to database)
   * @param data - Partial library item data
   * @returns Library item instance
   */
  create(data: Partial<LibraryItemEntity>): LibraryItemEntity

  /**
   * Update specific fields of a library item
   * @param id - Library item ID
   * @param userId - User ID who owns the item
   * @param data - Partial data to update
   * @returns Updated library item
   */
  update(
    id: string,
    userId: string,
    data: Partial<LibraryItemEntity>,
  ): Promise<LibraryItemEntity>

  /**
   * Bulk archive or unarchive library items
   * @param userId - User ID who owns the items
   * @param itemIds - List of library item IDs
   * @param archived - Whether to archive (true) or unarchive (false)
   * @returns Bulk operation result with success/failure counts
   */
  bulkArchive(
    userId: string,
    itemIds: string[],
    archived: boolean,
  ): Promise<BulkOperationResult>

  /**
   * Bulk delete library items (soft delete)
   * @param userId - User ID who owns the items
   * @param itemIds - List of library item IDs
   * @returns Bulk operation result with success/failure counts
   */
  bulkDelete(userId: string, itemIds: string[]): Promise<BulkOperationResult>

  /**
   * Bulk move library items to a different folder
   * @param userId - User ID who owns the items
   * @param itemIds - List of library item IDs
   * @param folder - Target folder (inbox, archive, trash)
   * @returns Bulk operation result with success/failure counts
   */
  bulkMoveToFolder(
    userId: string,
    itemIds: string[],
    folder: string,
  ): Promise<BulkOperationResult>

  /**
   * Bulk mark library items as read
   * @param userId - User ID who owns the items
   * @param itemIds - List of library item IDs
   * @returns Bulk operation result with success/failure counts
   */
  bulkMarkAsRead(
    userId: string,
    itemIds: string[],
  ): Promise<BulkOperationResult>
}
