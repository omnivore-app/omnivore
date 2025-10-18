import { Label } from '../../label/entities/label.entity'

/**
 * Repository interface for Label entity
 * Separates data access layer from business logic
 */
export interface ILabelRepository {
  /**
   * Find all labels for a user, sorted by position
   * @param userId - User ID who owns the labels
   * @returns Array of labels, sorted by position
   */
  findAll(userId: string): Promise<Label[]>

  /**
   * Find a label by ID and user ID
   * @param id - Label ID
   * @param userId - User ID who owns the label
   * @returns Label or null if not found
   */
  findById(id: string, userId: string): Promise<Label | null>

  /**
   * Find a label by name and user ID
   * @param name - Label name
   * @param userId - User ID who owns the label
   * @returns Label or null if not found
   */
  findByName(name: string, userId: string): Promise<Label | null>

  /**
   * Find multiple labels by IDs for a user
   * @param labelIds - Array of label IDs
   * @param userId - User ID who owns the labels
   * @returns Array of labels, sorted by position
   */
  findByIds(labelIds: string[], userId: string): Promise<Label[]>

  /**
   * Create a new label instance (without saving to database)
   * @param data - Partial label data
   * @returns Label instance
   */
  create(data: Partial<Label>): Label

  /**
   * Save (create or update) a label
   * @param label - Label to save
   * @returns Saved label
   */
  save(label: Label): Promise<Label>

  /**
   * Remove a label
   * @param label - Label to remove
   * @returns void
   */
  remove(label: Label): Promise<void>
}
