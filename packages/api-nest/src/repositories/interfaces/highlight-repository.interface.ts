import { HighlightEntity } from '../../highlight/entities/highlight.entity'

/**
 * Repository interface for Highlight entity
 * Separates data access layer from business logic
 */
export interface IHighlightRepository {
  /**
   * Find a highlight by ID and user ID
   * @param id - Highlight ID
   * @param userId - User ID who owns the highlight
   * @returns Highlight or null if not found
   */
  findById(id: string, userId: string): Promise<HighlightEntity | null>

  /**
   * Find all highlights for a library item
   * @param libraryItemId - Library item ID
   * @param userId - User ID who owns the highlights
   * @returns Array of highlights, sorted by position
   */
  findByLibraryItem(
    libraryItemId: string,
    userId: string,
  ): Promise<HighlightEntity[]>

  /**
   * Create a new highlight instance (without saving to database)
   * @param data - Partial highlight data
   * @returns Highlight instance
   */
  create(data: Partial<HighlightEntity>): HighlightEntity

  /**
   * Save (create or update) a highlight
   * @param highlight - Highlight to save
   * @returns Saved highlight
   */
  save(highlight: HighlightEntity): Promise<HighlightEntity>

  /**
   * Remove a highlight
   * @param highlight - Highlight to remove
   * @returns void
   */
  remove(highlight: HighlightEntity): Promise<void>
}
