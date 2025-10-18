import { EntityLabel } from '../../label/entities/entity-label.entity'

/**
 * Repository interface for EntityLabel entity
 * Manages the many-to-many relationship between library items and labels
 */
export interface IEntityLabelRepository {
  /**
   * Find entity labels for a library item with label relations loaded
   * @param libraryItemId - Library item ID
   * @returns Array of entity labels with label relations
   */
  findByLibraryItemId(libraryItemId: string): Promise<EntityLabel[]>

  /**
   * Delete all entity labels for a library item
   * @param libraryItemId - Library item ID
   * @returns void
   */
  deleteByLibraryItemId(libraryItemId: string): Promise<void>

  /**
   * Create a new entity label instance (without saving to database)
   * @param data - Partial entity label data
   * @returns EntityLabel instance
   */
  create(data: Partial<EntityLabel>): EntityLabel

  /**
   * Save (create or update) entity labels in bulk
   * @param entityLabels - Array of entity labels to save
   * @returns Saved entity labels
   */
  save(entityLabels: EntityLabel[]): Promise<EntityLabel[]>
}
