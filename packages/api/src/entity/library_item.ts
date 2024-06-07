import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Highlight } from './highlight'
import { Label } from './label'
import { Recommendation } from './recommendation'
import { UploadFile } from './upload_file'
import { User } from './user'

export enum LibraryItemState {
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Succeeded = 'SUCCEEDED',
  Deleted = 'DELETED',
  Archived = 'ARCHIVED',
  ContentNotFetched = 'CONTENT_NOT_FETCHED',
}

export enum ContentReaderType {
  WEB = 'WEB',
  PDF = 'PDF',
  EPUB = 'EPUB',
}

export enum DirectionalityType {
  LTR = 'LTR',
  RTL = 'RTL',
}

@Entity({ name: 'library_item' })
export class LibraryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('uuid')
  userId!: string

  @Column('enum', {
    enum: LibraryItemState,
    default: LibraryItemState.Succeeded,
  })
  state!: LibraryItemState

  @Column('text')
  originalUrl!: string

  @Column('text', { nullable: true })
  downloadUrl?: string | null

  @Column('text')
  slug!: string

  @Column('text')
  title!: string

  @Column('text', { nullable: true })
  author?: string | null

  @Column('text', { nullable: true })
  description?: string | null

  @Column('timestamptz')
  savedAt!: Date

  @CreateDateColumn()
  createdAt!: Date

  @Column('timestamptz', { nullable: true })
  publishedAt?: Date | null

  @Column('timestamptz')
  archivedAt?: Date | null

  @Column('timestamptz')
  deletedAt?: Date | null

  @Column('timestamptz')
  readAt?: Date | null

  @UpdateDateColumn()
  updatedAt!: Date

  @Column('text', { nullable: true })
  itemLanguage?: string | null

  @Column('integer', { nullable: true })
  wordCount?: number | null

  @Column('text', { nullable: true })
  siteName?: string | null

  @Column('text', { nullable: true })
  siteIcon?: string | null

  @Column('integer')
  readingProgressLastReadAnchor!: number

  @Column('integer')
  readingProgressHighestReadAnchor!: number

  @Column('real')
  readingProgressTopPercent!: number

  @Column('real')
  readingProgressBottomPercent!: number

  @Column('text', { nullable: true })
  thumbnail?: string | null

  @Column('text')
  itemType!: string

  @OneToOne(() => UploadFile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'upload_file_id' })
  uploadFile?: UploadFile

  // get upload_file_id without joining relations
  @Column('text', { nullable: true })
  uploadFileId?: string

  @Column('enum', { enum: ContentReaderType, default: ContentReaderType.WEB })
  contentReader!: ContentReaderType

  @Column('text', { nullable: true })
  originalContent?: string | null

  @Column('text')
  readableContent!: string

  // NOT SUPPORTED IN TYPEORM
  // @Column('vector', { nullable: true })
  // embedding?: number[]

  @Column('text', { nullable: true })
  textContentHash?: string | null

  @Column('text', { nullable: true })
  subscription?: string | null

  @ManyToMany(() => Label, { cascade: true })
  @JoinTable({
    name: 'entity_labels',
    joinColumn: { name: 'library_item_id' },
    inverseJoinColumn: { name: 'label_id' },
  })
  labels?: Label[]

  @OneToMany(
    () => Recommendation,
    (recommendation) => recommendation.libraryItem,
    { cascade: true }
  )
  @JoinTable({
    name: 'recommendation',
    joinColumn: { name: 'library_item_id' },
    inverseJoinColumn: { name: 'id' },
  })
  recommendations?: Recommendation[]

  @Column('enum', { enum: DirectionalityType, default: DirectionalityType.LTR })
  directionality!: DirectionalityType

  @OneToMany(() => Highlight, (highlight) => highlight.libraryItem, {
    cascade: true,
  })
  @JoinTable({
    name: 'highlight',
    joinColumn: { name: 'library_item_id' },
    inverseJoinColumn: { name: 'id' },
  })
  highlights?: Highlight[]

  @Column('text', { nullable: true })
  note?: string | null

  @Column('text', { nullable: true })
  recommenderNames?: string[] | null

  @Column('jsonb')
  links?: any | null

  @Column('text')
  feedContent?: string | null

  @Column('text')
  previewContentType?: string | null

  @Column('text')
  folder!: string

  @Column('text')
  labelNames?: string[]

  @Column('text')
  highlightAnnotations?: string[]

  @Column('timestamptz')
  seenAt?: Date

  @Column('ltree')
  topic?: string

  @Column('timestamptz')
  digestedAt?: Date

  @Column('float')
  score?: number

  @Column('text')
  previewContent?: string
}
