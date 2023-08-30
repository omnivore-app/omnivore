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
  Note = 'NOTE', // allowing people to add a note at the document level
}

@Entity({ name: 'highlight' })
export class Highlight {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({ type: 'varchar', length: 14 })
  shortId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => LibraryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'library_item_id' })
  libraryItem!: LibraryItem

  @Column('text')
  quote!: string

  @Column({ type: 'varchar', length: 5000 })
  prefix?: string

  @Column({ type: 'varchar', length: 5000 })
  suffix?: string

  @Column('text')
  patch!: string

  @Column('text')
  annotation?: string

  @Column('boolean')
  deleted?: boolean

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @Column('timestamp')
  sharedAt?: Date

  @Column('real')
  highlightPositionPercent!: number

  @Column('integer')
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

  @ManyToMany(() => Label, { cascade: true })
  @JoinTable({
    name: 'entity_labels',
    joinColumn: { name: 'highlight_id' },
    inverseJoinColumn: { name: 'label_id' },
  })
  labels?: Label[]
}
