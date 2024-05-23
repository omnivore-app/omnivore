import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { PublicItemInteraction } from './public_item_interaction'

@Entity()
export class PublicItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @OneToOne(() => PublicItemInteraction)
  interaction?: PublicItemInteraction

  @Column('uuid')
  sourceId!: string

  @Column('text')
  type!: string

  @Column('text')
  title!: string

  @Column('text')
  url!: string

  @Column('boolean')
  approved!: boolean

  @Column('text', { nullable: true })
  thumbnail?: string | null

  @Column('text', { nullable: true })
  previewContent?: string | null

  @Column('text', { nullable: true })
  languageCode?: string | null

  @Column('text', { nullable: true })
  author?: string | null

  @Column('text', { nullable: true })
  dir?: string | null

  @Column('timestamptz', { nullable: true })
  publishedAt?: Date | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
