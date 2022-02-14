// Table "omnivore.links"
// Column                 |           Type           | Collation | Nullable |       Default
// ---------------------------------------+--------------------------+-----------+----------+----------------------
// article_url                           | text                     |           | not null |
// article_hash                          | text                     |           | not null |
// created_at                            | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
// shared_comment                        | text                     |           |          |
// article_reading_progress              | real                     |           | not null | 0
// article_reading_progress_anchor_index | integer                  |           | not null | 0
// shared_with_highlights                | boolean                  |           |          | false

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { User } from './user'
import { Page } from './page'
import { Label } from './label'

@Entity({ name: 'links' })
export class Link extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  slug!: string

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @OneToOne(() => Page)
  @JoinColumn({ name: 'article_id' })
  page!: Page

  @Column('timestamp')
  savedAt!: Date

  @Column('timestamp')
  sharedAt!: Date | null

  @Column('timestamp')
  archivedAt?: Date | null

  @Column('text')
  articleUrl!: string

  @Column('text')
  articleHash!: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @OneToMany(() => Label, (label) => label.link)
  labels?: Label[]
}
