import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UploadFile } from './upload_file'
import { User } from './user'

export enum LibraryItemState {
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Succeeded = 'SUCCEEDED',
  Deleted = 'DELETED',
  Archived = 'ARCHIVED',
}

export enum LibraryItemType {
  Article = 'ARTICLE',
  Book = 'BOOK',
  File = 'FILE',
  Profile = 'PROFILE',
  Website = 'WEBSITE',
  Tweet = 'TWEET',
  Video = 'VIDEO',
  Image = 'IMAGE',
  Unknown = 'UNKNOWN',
}

export enum ContentReaderType {
  WEB = 'WEB',
  PDF = 'PDF',
  EPUB = 'EPUB',
}

@Entity({ name: 'library_item' })
export class LibraryItem {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('enum', {
    enum: LibraryItemState,
    default: LibraryItemState.Succeeded,
  })
  state?: LibraryItemState

  @Column('text')
  originalUrl!: string

  @Column('text', { nullable: true })
  downloadUrl?: string

  @Column('text')
  slug!: string

  @Column('text')
  title!: string

  @Column('text', { nullable: true })
  author?: string

  @Column('text', { nullable: true })
  description?: string

  @Column('timestamptz')
  savedAt?: Date

  @CreateDateColumn()
  createdAt?: Date

  @Column('timestamptz', { nullable: true })
  publishedAt?: Date

  @Column('timestamptz')
  archivedAt?: Date

  @Column('timestamptz')
  deletedAt?: Date

  @Column('timestamptz')
  readAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @Column('text', { nullable: true })
  itemLanguage?: string

  @Column('integer', { nullable: true })
  wordCount?: number

  @Column('text', { nullable: true })
  siteName?: string

  @Column('text', { nullable: true })
  siteIcon?: string

  @Column('json', { nullable: true })
  metadata?: Record<string, unknown>

  @Column('integer', { nullable: true })
  readingProgressLastReadAnchor?: number

  @Column('integer', { nullable: true })
  readingProgressHighestReadAnchor?: number

  @Column('real', { nullable: true })
  readingProgressTopPercent?: number

  @Column('real', { nullable: true })
  readingProgressBottomPercent?: number

  @Column('text', { nullable: true })
  thumbnail?: string

  @Column('enum', { enum: LibraryItemType, default: LibraryItemType.Unknown })
  itemType?: LibraryItemType

  @OneToOne(() => UploadFile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'upload_file_id' })
  uploadFile?: UploadFile

  @Column('enum', { enum: ContentReaderType, default: ContentReaderType.WEB })
  contentReader?: ContentReaderType

  @Column('text', { nullable: true })
  originalContent?: string

  @Column('text', { nullable: true })
  readableContent?: string

  @Column('tsvector', { nullable: true })
  contentTsv?: string

  @Column('tsvector', { nullable: true })
  siteTsv?: string

  @Column('tsvector', { nullable: true })
  titleTsv?: string

  @Column('tsvector', { nullable: true })
  authorTsv?: string

  @Column('tsvector', { nullable: true })
  descriptionTsv?: string

  @Column('tsvector', { nullable: true })
  searchTsv?: string

  @Column('text', { nullable: true })
  modelName?: string

  // NOT SUPPORTED IN TYPEORM
  // @Column('vector', { nullable: true })
  // embedding?: number[]

  @Column('text', { nullable: true })
  textContentHash?: string

  @Column('text', { nullable: true })
  gcsArchiveId?: string
}
