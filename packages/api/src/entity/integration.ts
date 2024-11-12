import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user'

export enum IntegrationType {
  Export = 'EXPORT',
  Import = 'IMPORT',
}

export enum ImportItemState {
  Unread = 'UNREAD',
  Unarchived = 'UNARCHIVED',
  Archived = 'ARCHIVED',
  All = 'ALL',
}

@Entity({ name: 'integrations' })
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('uuid', { name: 'user_id' })
  userId!: string

  @Column('varchar', { length: 40 })
  name!: string

  @Column('enum', {
    enum: IntegrationType,
    default: IntegrationType.Export,
  })
  type!: IntegrationType

  @Column('varchar', { length: 255 })
  token!: string

  @Column('boolean', { default: true })
  enabled!: boolean

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @Column('timestamp', { nullable: true })
  syncedAt?: Date | null

  @Column('text', { nullable: true })
  taskName?: string | null

  @Column('enum', { enum: ImportItemState, nullable: true })
  importItemState?: ImportItemState | null

  @Column('jsonb', { nullable: true })
  settings?: any
}
