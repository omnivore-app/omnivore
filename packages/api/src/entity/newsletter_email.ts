import {
  Entity,
  BaseEntity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user'

@Entity({ name: 'newsletter_emails' })
export class NewsletterEmail extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('varchar')
  address!: string

  @ManyToOne(() => User, (user) => user.newsletterEmails)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('varchar', { nullable: true })
  confirmationCode?: string
}
