import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Label } from './label'
import { LibraryItem } from './library_item'
import { User } from './user'

export enum HighlightType {
  Highlight = 'HIGHLIGHT',
  Redaction = 'REDACTION', // allowing people to remove text from the page
  Note = 'NOTE', // to be deleted in favor of note on library item
}

export enum RepresentationType {
  Content = 'CONTENT',
  FeedContent = 'FEED_CONTENT',
}

@Entity({ name: 'highlight' })
export class Highlight {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 14 })
  shortId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('uuid')
  userId!: string

  @ManyToOne(() => LibraryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'library_item_id' })
  libraryItem!: LibraryItem

  @Column('uuid')
  libraryItemId!: string

  @Column('text')
  quote?: string | null

  @Column({ type: 'varchar', length: 5000 })
  prefix?: string | null

  @Column({ type: 'varchar', length: 5000 })
  suffix?: string | null

  @Column('text')
  patch?: string | null

  @Column('text')
  annotation?: string | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @Column('timestamp')
  sharedAt?: Date

  @Column('real', { default: 0 })
  highlightPositionPercent!: number

  @Column('integer', { default: 0 })
  highlightPositionAnchorIndex!: number

  @Column('enum', {
    enum: HighlightType,
    default: HighlightType.Highlight,
  })
  highlightType!: HighlightType

  @Column('text', { nullable: true })
  html?: string | null

  @Column('text', { nullable: true })
  color?: string | null

  @ManyToMany(() => Label, { cascade: true, eager: true })
  @JoinTable({
    name: 'entity_labels',
    joinColumn: { name: 'highlight_id' },
    inverseJoinColumn: { name: 'label_id' },
  })
  labels?: Label[]

  @Column('enum', {
    enum: RepresentationType,
    default: RepresentationType.Content,
  })
  representation!: RepresentationType
}
