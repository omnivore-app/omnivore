import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { NewsletterEmail } from './newsletter_email'
import { User } from './user'

export const DEFAULT_SUBSCRIPTION_FOLDER = 'following'

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Unsubscribed = 'UNSUBSCRIBED',
}

export enum SubscriptionType {
  Newsletter = 'NEWSLETTER',
  Rss = 'RSS',
}

export enum FetchContentType {
  Always = 'ALWAYS',
  Never = 'NEVER',
  WhenEmpty = 'WHEN_EMPTY',
}

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text')
  name!: string

  @Column('enum', {
    enum: SubscriptionStatus,
    default: SubscriptionStatus.Active,
  })
  status!: SubscriptionStatus

  @ManyToOne(() => NewsletterEmail, { nullable: true })
  @JoinColumn({ name: 'newsletter_email_id' })
  newsletterEmail?: NewsletterEmail | null

  @Column('text', { nullable: true })
  description?: string

  @Column('text', { nullable: true })
  url?: string

  @Column('text', { nullable: true })
  unsubscribeMailTo?: string

  @Column('text', { nullable: true })
  unsubscribeHttpUrl?: string

  @Column('text', { nullable: true })
  icon?: string | null

  @Column('enum', {
    enum: SubscriptionType,
  })
  type!: SubscriptionType

  @Column('integer', { default: 0 })
  count!: number

  @Column('timestamp', { nullable: true })
  mostRecentItemDate?: Date | null

  @Column('text', { nullable: true })
  lastFetchedChecksum?: string | null

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @Column('timestamp', { nullable: true })
  scheduledAt?: Date | null

  @Column('timestamp', { nullable: true })
  refreshedAt?: Date | null

  @Column('timestamp', { nullable: true })
  failedAt?: Date | null

  @Column('boolean')
  isPrivate?: boolean | null

  @Column('boolean')
  autoAddToLibrary?: boolean | null

  @Column('boolean')
  fetchContent!: boolean

  @Column('enum', {
    enum: FetchContentType,
    default: FetchContentType.Always,
  })
  fetchContentType!: FetchContentType

  @Column('text')
  folder?: string | null
}
