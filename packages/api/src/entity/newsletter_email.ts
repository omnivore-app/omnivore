import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user'

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
  confirmationCode?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
