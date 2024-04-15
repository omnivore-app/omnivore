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

@Entity({ name: 'received_emails' })
export class ReceivedEmail {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
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
  replyTo?: string

  @Column('text')
  reply?: string

  @Column('text')
  type!: 'article' | 'non-article'

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}
