import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { EntityLabel } from '../../label/entities/entity-label.entity'
import { User } from '../../user/entities/user.entity'

export enum LibraryItemState {
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  DELETED = 'DELETED',
  ARCHIVED = 'ARCHIVED',
  CONTENT_NOT_FETCHED = 'CONTENT_NOT_FETCHED',
}

export enum ContentReaderType {
  WEB = 'WEB',
  PDF = 'PDF',
  EPUB = 'EPUB',
}

@Entity({ name: 'library_item', schema: 'omnivore' })
export class LibraryItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @Column({
    type: 'enum',
    enum: LibraryItemState,
    default: LibraryItemState.SUCCEEDED,
  })
  state!: LibraryItemState

  @Column({ name: 'original_url', type: 'text' })
  originalUrl!: string

  @Column({ type: 'text' })
  slug!: string

  @Column({ type: 'text' })
  title!: string

  @Column({ type: 'text', nullable: true })
  author?: string | null

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @Column({ name: 'saved_at', type: 'timestamptz' })
  savedAt!: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date | null

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date | null

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'word_count', type: 'integer', nullable: true })
  wordCount?: number | null

  @Column({ name: 'site_name', type: 'text', nullable: true })
  siteName?: string | null

  @Column({ name: 'site_icon', type: 'text', nullable: true })
  siteIcon?: string | null

  /**
   * SHA-256 hash of sanitized content for version tracking
   * Used by sentinel-based reading progress to detect content changes
   */
  @Column({ name: 'content_hash', type: 'varchar', length: 64, nullable: true })
  contentHash?: string | null

  /**
   * Total number of sentinel markers in the article content
   * Used to calculate reading progress percentage
   */
  @Column({ name: 'total_sentinels', type: 'integer', default: 0 })
  totalSentinels!: number

  @Column({ type: 'text', nullable: true })
  thumbnail?: string | null

  @Column({ name: 'item_type', type: 'text', default: 'ARTICLE' })
  itemType!: string

  @Column({
    name: 'content_reader',
    type: 'enum',
    enum: ContentReaderType,
    default: ContentReaderType.WEB,
  })
  contentReader!: ContentReaderType

  @Column({ type: 'text' })
  folder!: string

  @Column({
    name: 'label_names',
    type: 'text',
    array: true,
    nullable: true,
    default: [],
  })
  labelNames?: string[] | null

  @Column({ name: 'readable_content', type: 'text', default: '' })
  readableContent!: string

  @Column({ type: 'text', nullable: true })
  note?: string | null

  @Column({ name: 'note_updated_at', type: 'timestamptz', nullable: true })
  noteUpdatedAt?: Date | null

  @OneToMany(() => EntityLabel, (entityLabel) => entityLabel.libraryItem)
  entityLabels!: EntityLabel[]
}
