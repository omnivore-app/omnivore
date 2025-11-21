import { ReadingProgressEntity } from '../../reading-progress/entities/reading-progress.entity'

/**
 * Repository interface for ReadingProgress entity
 * Manages sentinel-based reading position tracking per user/item/content version
 */
export interface IReadingProgressRepository {
  /**
   * Find reading progress for a library item (optionally filtered by content version)
   * @param libraryItemId - Library item ID
   * @param userId - User ID who owns the progress
   * @param contentVersion - Optional content hash/version to filter by
   * @returns Reading progress or null if not found
   */
  findProgress(
    libraryItemId: string,
    userId: string,
    contentVersion?: string | null,
  ): Promise<ReadingProgressEntity | null>

  /**
   * Find the most recent reading progress for a library item (any version)
   * @param libraryItemId - Library item ID
   * @param userId - User ID who owns the progress
   * @returns Most recent reading progress or null
   */
  findLatestProgress(
    libraryItemId: string,
    userId: string,
  ): Promise<ReadingProgressEntity | null>

  /**
   * Create a new reading progress instance (without saving to database)
   * @param data - Partial reading progress data
   * @returns Reading progress instance
   */
  create(data: Partial<ReadingProgressEntity>): ReadingProgressEntity

  /**
   * Save (create or update) reading progress
   * Uses upsert to handle conflicts on unique constraint
   * @param progress - Reading progress to save
   * @returns Saved reading progress
   */
  save(progress: ReadingProgressEntity): Promise<ReadingProgressEntity>

  /**
   * Update or create reading progress for a library item
   * Handles upserting based on unique constraint (user, item, version)
   * @param userId - User ID
   * @param libraryItemId - Library item ID
   * @param contentVersion - Content hash/version (nullable)
   * @param lastSeenSentinel - Last sentinel scrolled past
   * @param highestSeenSentinel - Highest sentinel ever reached
   * @returns Updated/created reading progress
   */
  upsertProgress(
    userId: string,
    libraryItemId: string,
    contentVersion: string | null,
    lastSeenSentinel: number,
    highestSeenSentinel: number,
  ): Promise<ReadingProgressEntity>

  /**
   * Batch find latest reading progress for multiple library items
   * Used by DataLoader to prevent N+1 queries
   * @param libraryItemIds - Array of library item IDs
   * @param userId - User ID who owns the progress
   * @returns Map of library item ID to reading progress
   */
  findByLibraryItemIds(
    libraryItemIds: string[],
    userId: string,
  ): Promise<Map<string, ReadingProgressEntity>>
}
