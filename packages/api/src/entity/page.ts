import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'pages' })
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  url!: string

  @Column('text')
  hash!: string

  @Column('text')
  title!: string

  @Column('text', { nullable: true })
  uploadFileId!: string

  @Column('text', { nullable: true })
  author!: string

  @Column('text', { nullable: true })
  description!: string

  @Column('text', { nullable: true })
  image!: string

  @Column('text')
  content!: string

  @Column('text', { name: 'page_type' })
  type!: string

  @Column('text', { nullable: true })
  originalHtml!: string

  @Column('timestamp')
  publishedAt?: Date

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
