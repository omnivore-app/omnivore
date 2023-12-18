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
import { User } from './user'
import { Subscription } from './subscription'

export const DEFAULT_NEWSLETTER_FOLDER = 'following'
export const EXISTING_NEWSLETTER_FOLDER = 'inbox'

@Entity({ name: 'newsletter_emails' })
export class NewsletterEmail {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('varchar')
  address!: string

  @ManyToOne(() => User, (user) => user.newsletterEmails)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('varchar', { nullable: true })
  confirmationCode?: string | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => Subscription, (subscription) => subscription.newsletterEmail)
  subscriptions!: Subscription[]

  @Column('text')
  folder?: string | null

  @Column('text')
  name?: string | null

  @Column('text')
  description?: string | null
}
