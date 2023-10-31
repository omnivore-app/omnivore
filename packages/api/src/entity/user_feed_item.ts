import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { FeedItem } from './feed_item'
import { User } from './user'

@Entity()
export class UserFeedItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @Column('timestamptz')
  hiddenAt?: Date | null

  @Column('timestamptz')
  savedAt?: Date | null

  @ManyToOne(() => FeedItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feed_item_id' })
  feedItem!: FeedItem

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
