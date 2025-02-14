import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  createConnection,
  Connection,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'
import AdminJs from 'adminjs'
import { Database, Resource } from '@adminjs/typeorm'

export const registerDatabase = async (secrets: any): Promise<Connection> => {
  AdminJs.registerAdapter({ Database, Resource })

  let host = 'localhost'
  if (process.env.K_SERVICE) {
    console.log(
      'connecting to database via Cloud Run connection',
      process.env.CLOUD_SQL_CONNECTION_NAME
    )
    const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql'
    host = `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`
  }

  console.log('connecting to database:', {
    type: 'postgres',
    host: host,
    schema: 'omnivore',
    database: secrets.DB_DATABASE,
  })

  const connection = await createConnection({
    type: 'postgres',
    host: host,
    schema: 'omnivore',
    username: secrets.DB_USER,
    password: secrets.DB_PASS,
    database: secrets.DB_DATABASE,
    entities: [
      AdminUser,
      User,
      UserProfile,
      ReceivedEmail,
      ContentDisplayReport,
      Group,
      Integration,
      Subscription,
      LibraryItem,
      UploadFile,
      Recommendation,
      GroupMembership,
      Features,
      EmailAddress,
      Rule,
      Export,
    ],
  })

  return connection
}

export enum StatusType {
  Active = 'ACTIVE',
  Pending = 'PENDING',
}

export enum AuthProvider {
  Apple = 'APPLE',
  Google = 'GOOGLE',
  Email = 'EMAIL',
}

export enum LibraryItemState {
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Succeeded = 'SUCCEEDED',
  Deleted = 'DELETED',
  Archived = 'ARCHIVED',
  ContentNotFetched = 'CONTENT_NOT_FETCHED',
}

@Entity({ name: 'admin_user' })
export class AdminUser extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: string

  @Column({ type: 'text' })
  public email!: string

  @Column({ type: 'text' })
  public password!: string
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  name!: string

  @Column({ type: 'text' })
  public email!: string

  @Column({ type: 'timestamp' })
  public created_at!: Date

  @Column({ type: 'timestamp' })
  public updated_at!: Date

  @Column({ type: 'enum', enum: StatusType })
  status!: StatusType

  @Column({ type: 'text' })
  source_user_id!: string

  @Column({ type: 'enum', enum: AuthProvider })
  source!: AuthProvider
}

@Entity()
export class UserProfile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text' })
  public username!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User
}

@Entity({ name: 'content_display_report' })
export class ContentDisplayReport extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User

  @Column({ type: 'text', name: 'original_url' })
  originalUrl!: string

  @Column({ type: 'text', name: 'report_comment' })
  reportComment!: string

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date
}

@Entity({ name: 'received_emails' })
export class ReceivedEmail extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User

  @Column('text')
  from!: string

  @Column('text')
  to!: string

  @Column('text')
  subject!: string

  @Column('text')
  text!: string

  @Column('text')
  html!: string

  @Column('text')
  type!: 'article' | 'non-article'

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date
}

@Entity()
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  name!: string

  @OneToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: User

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date

  @Column('text', { nullable: true })
  description?: string | null

  @Column('text', { nullable: true })
  topics?: string | null

  @Column('boolean', { default: false, name: 'only_admin_can_post' })
  onlyAdminCanPost!: boolean

  @Column('boolean', { default: false, name: 'only_admin_can_see_members' })
  onlyAdminCanSeeMembers!: boolean
}

@Entity({ name: 'integrations' })
export class Integration extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User

  @Column('varchar', { length: 40 })
  name!: string

  @Column('varchar', { length: 255 })
  token!: string

  @Column('boolean', { default: true })
  enabled!: boolean

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'synced_at', type: 'timestamp', nullable: true })
  syncedAt?: Date | null
}

enum SubscriptionStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Unsubscribed = 'UNSUBSCRIBED',
}

enum SubscriptionType {
  Newsletter = 'NEWSLETTER',
  Rss = 'RSS',
}

@Entity({ name: 'subscriptions' })
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User

  @Column('text')
  name!: string

  @Column('enum', {
    enum: SubscriptionStatus,
    default: SubscriptionStatus.Active,
  })
  status!: SubscriptionStatus

  @Column('text', { nullable: true })
  url?: string

  @Column('enum', {
    enum: SubscriptionType,
  })
  type!: SubscriptionType

  @Column('integer', { default: 0 })
  count!: number

  @Column({ type: 'timestamp', name: 'refreshed_at', nullable: true })
  refreshedAt?: Date | null

  @Column({ type: 'timestamp', name: 'most_recent_item_date', nullable: true })
  mostRecentItemDate?: Date | null

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date
}

@Entity({ name: 'library_item' })
export class LibraryItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User

  @Column({ type: 'enum', enum: LibraryItemState })
  state!: LibraryItemState

  @Column({ type: 'text', name: 'original_url' })
  originalUrl!: string

  @Column({ type: 'text', name: 'download_url' })
  downloadlUrl!: string

  @Column('text')
  slug!: string

  @Column('text')
  title!: string

  @Column('text', { nullable: true })
  author?: string | null

  @Column('text', { nullable: true })
  subscription?: string | null

  @OneToOne(() => UploadFile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'upload_file_id' })
  uploadFile?: UploadFile

  @Column({ type: 'timestamp', name: 'saved_at' })
  savedAt!: Date

  @Column({ type: 'timestamp', name: 'deleted_at' })
  deletedAt?: Date | null

  @Column({ type: 'timestamp', name: 'archived_at' })
  archivedAt!: Date | null

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date
}

@Entity({ name: 'upload_files' })
export class UploadFile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User

  @Column('text')
  url!: string

  @Column('text')
  fileName!: string

  @Column('text')
  contentType!: string

  @Column('text')
  status!: string

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date
}

@Entity({ name: 'recommendation' })
export class Recommendation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'recommender_id' })
  @ManyToOne(() => User, { eager: true })
  recommender!: User

  @JoinColumn({ name: 'library_item_id' })
  @ManyToOne(() => User, { eager: true })
  libraryItem!: LibraryItem

  @JoinColumn({ name: 'group_id' })
  @ManyToOne(() => User, { eager: true })
  group!: Group

  @Column('text', { nullable: true })
  note?: string | null

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date
}

@Entity({ name: 'group_membership' })
export class GroupMembership extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User

  @JoinColumn({ name: 'group_id' })
  group!: Group

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date

  @Column('boolean', { default: false })
  is_admin!: boolean
}

@Entity({ name: 'features' })
export class Features extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User

  @Column('text')
  name!: string

  @Column('timestamp', { nullable: true, name: 'granted_at' })
  grantedAt?: Date | null

  @Column('timestamp', { nullable: true, name: 'expires_at' })
  expiresAt?: Date | null

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date
}

@Entity({ name: 'newsletter_emails' })
export class EmailAddress extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User)
  user!: User

  @Column('varchar')
  address!: string

  @Column('text')
  folder?: string | null

  @Column('text')
  name?: string | null

  @Column('text')
  description?: string | null

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date
}

@Entity({ name: 'rules' })
export class Rule extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User)
  user!: User

  @Column('varchar')
  name!: string

  @Column('text')
  filter!: string

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date

  @Column({ type: 'timestamp', name: 'failed_at' })
  failedAt?: Date
}

@Entity({ name: 'export' })
export class Export extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { eager: true })
  user!: User

  @Column('text', { nullable: true })
  task_id?: string

  @Column('text')
  state!: string

  @Column('int', { default: 0 })
  total_items!: number

  @Column('int', { default: 0 })
  processed_items!: number

  @Column('text', { nullable: true })
  signed_url?: string

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date
}
