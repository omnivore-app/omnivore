import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Export {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  userId!: string

  @Column('text', { nullable: true })
  taskId?: string

  @Column('text')
  state!: string

  @Column('int', { default: 0 })
  totalItems!: number

  @Column('int', { default: 0 })
  processedItems!: number

  @Column('text', { nullable: true })
  signedUrl?: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
