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

@Entity({ name: 'rss_subscription' })
export class RssSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('varchar', { length: 255 })
  title!: string

  @Column('text', { nullable: true })
  description?: string | null

  @Column('text')
  url!: string

  @Column('text', { nullable: true })
  imageUrl?: string | null

  @Column('integer', { default: 0 })
  count!: number

  @Column('timestamp', { nullable: true })
  lastFetchedAt?: Date | null

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}
