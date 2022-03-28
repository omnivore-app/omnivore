import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class ContentDisplayReport extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column('text')
  userId!: string

  @Column('text')
  pageId?: string

  @Column('text')
  content!: string

  @Column('text')
  originalHtml!: string | undefined

  @Column('text')
  originalUrl!: string

  @Column('text')
  reportComment!: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date

  @Column('text')
  elasticPageId?: string
}
