import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../../user/entities/user.entity'
import { LibraryItemEntity } from '../../library/entities/library-item.entity'

export enum HighlightType {
  HIGHLIGHT = 'HIGHLIGHT',
  REDACTION = 'REDACTION',
  NOTE = 'NOTE', // Legacy - being phased out in favor of library_item.note
}

export enum RepresentationType {
  CONTENT = 'CONTENT',
  FEED_CONTENT = 'FEED_CONTENT',
}

@Entity({ name: 'highlight', schema: 'omnivore' })
export class HighlightEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'short_id', type: 'varchar', length: 14 })
  shortId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @ManyToOne(() => LibraryItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'library_item_id' })
  libraryItem!: LibraryItemEntity

  @Column({ name: 'library_item_id', type: 'uuid' })
  libraryItemId!: string

  @Column({ type: 'text', nullable: true })
  quote?: string | null

  @Column({ type: 'varchar', length: 5000, nullable: true })
  prefix?: string | null

  @Column({ type: 'varchar', length: 5000, nullable: true })
  suffix?: string | null

  @Column({ type: 'text', nullable: true })
  patch?: string | null

  @Column({ type: 'text', nullable: true })
  annotation?: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'shared_at', type: 'timestamptz', nullable: true })
  sharedAt?: Date | null

  @Column({ name: 'highlight_position_percent', type: 'real', default: 0 })
  highlightPositionPercent!: number

  @Column({ name: 'highlight_position_anchor_index', type: 'integer', default: 0 })
  highlightPositionAnchorIndex!: number

  @Column({
    name: 'highlight_type',
    type: 'enum',
    enum: HighlightType,
    default: HighlightType.HIGHLIGHT,
  })
  highlightType!: HighlightType

  @Column({ type: 'text', nullable: true })
  html?: string | null

  @Column({ type: 'text', nullable: true })
  color?: string | null

  @Column({
    type: 'enum',
    enum: RepresentationType,
    default: RepresentationType.CONTENT,
  })
  representation!: RepresentationType
}
