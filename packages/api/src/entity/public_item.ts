import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { PublicItemStats } from './public_item_stats'

@Entity({ name: 'public_item' })
export class PublicItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @OneToOne(() => PublicItemStats)
  stats!: PublicItemStats

  @Column('text')
  sourceName!: string

  @Column('text')
  sourceIcon?: string

  @Column('text')
  type!: string

  @Column('text')
  title!: string

  @Column('text')
  url!: string

  @Column('boolean')
  approved!: boolean

  @Column('text')
  thumbnail?: string

  @Column('text')
  previewContent?: string

  @Column('text')
  languageCode?: string

  @Column('text')
  author?: string

  @Column('text')
  dir?: string

  @Column('timestamptz')
  publishedAt?: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @Column('text')
  topic?: string

  @Column('integer')
  wordCount?: number

  @Column('text')
  siteName?: string
}
