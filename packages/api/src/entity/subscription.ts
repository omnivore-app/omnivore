import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { SubscriptionStatus, SubscriptionType } from '../generated/graphql'
import { NewsletterEmail } from './newsletter_email'
import { User } from './user'

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
  lastFetchedAt?: Date | null

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}
