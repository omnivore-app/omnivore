import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class PublicItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  source_name!: string

  @Column('text')
  source_icon!: string

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
}
