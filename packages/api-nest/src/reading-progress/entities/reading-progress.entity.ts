import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../../user/entities/user.entity'
import { LibraryItemEntity } from '../../library/entities/library-item.entity'

/**
 * Reading progress tracking using I/O sentinels for stable, content-aware positioning
 *
 * Replaces scroll percentages with sentinel-based tracking that survives:
 * - Content updates
 * - Dynamic layout changes
 * - Different screen sizes
 * - Image lazy loading
 */
@Entity({ name: 'reading_progress', schema: 'omnivore' })
@Index(['userId', 'libraryItemId', 'contentVersion'], {
  unique: true,
  where: "content_version IS NOT NULL OR content_version = ''",
})
@Index(['userId', 'libraryItemId', 'contentVersion'])
@Index(['userId', 'libraryItemId', 'updatedAt'])
export class ReadingProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  // ==================== Relations ====================

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User

  @Column({ name: 'library_item_id', type: 'uuid' })
  libraryItemId!: string

  @ManyToOne(() => LibraryItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'library_item_id' })
  libraryItem?: LibraryItemEntity

  // ==================== Content Version ====================

  /**
   * Hash/version of the content this progress applies to
   * Enables detection of content changes and re-anchoring
   */
  @Column({
    name: 'content_version',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  contentVersion?: string | null

  // ==================== Sentinel Positions ====================

  /**
   * Most recent sentinel the user scrolled past (viewport bottom)
   * Used to restore reading position
   */
  @Column({ name: 'last_seen_sentinel', type: 'int', default: 0 })
  lastSeenSentinel!: number

  /**
   * Highest sentinel ever reached by this user
   * Used for completion tracking and "furthest read" indicator
   */
  @Column({ name: 'highest_seen_sentinel', type: 'int', default: 0 })
  highestSeenSentinel!: number

  // ==================== Timestamps ====================

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date
}
