import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Feed } from './feed'

@Entity()
export class FeedItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  guid!: string

  @Column('text')
  title!: string

  @Column('array')
  links!: string[]

  @Column('text')
  author?: string | null

  @Column('text')
  summary?: string | null

  @Column('array')
  categories?: string[] | null

  @Column('text')
  content?: string | null

  @Column('text')
  previewContent?: string | null

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @Column('timestamptz')
  publishedAt?: Date | null

  @ManyToOne(() => Feed, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feed_id' })
  feed!: Feed
}
