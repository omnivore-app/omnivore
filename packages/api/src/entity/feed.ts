import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Feed {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  title!: string

  @Column('text')
  url!: string

  @Column('text')
  author?: string

  @Column('text')
  description?: string

  @Column('text')
  image?: string

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @Column('timestamptz')
  publishedAt?: Date | null
}
